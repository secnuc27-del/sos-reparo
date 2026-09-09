import { onValue, push, ref, set } from "firebase/database";
import { database } from "./firebase";
import { useEffect, useState } from "react";

export type MensagemChat = {
  id: string;
  texto: string;
  remetente: "cliente" | "tecnico";
  dataISO: string;
  anexos?: string[]; // base64 ou URL do Firebase Storage
};

const CHAT_PATH = "chatOS";
const CHAT_LOCAL = "sos_chat_local";

export function lerChatLocal(token: string): MensagemChat[] {
  try {
    const salvo = localStorage.getItem(CHAT_LOCAL);
    const mapa = salvo ? JSON.parse(salvo) : {};
    return mapa[token] || [];
  } catch {
    return [];
  }
}

export function salvarChatLocal(token: string, mensagens: MensagemChat[]) {
  try {
    const salvo = localStorage.getItem(CHAT_LOCAL);
    const mapa = salvo ? JSON.parse(salvo) : {};
    mapa[token] = mensagens;
    localStorage.setItem(CHAT_LOCAL, JSON.stringify(mapa));
    window.dispatchEvent(new CustomEvent("sos-chat-update", { detail: { token } }));
  } catch {}
}

export function marcarChatComoLido(token: string, papel: "tecnico" | "cliente" = "tecnico") {
  if (!token) return;
  try {
    const key = `sos_chat_lido_${papel}`;
    const salvo = localStorage.getItem(key);
    const mapa = salvo ? JSON.parse(salvo) : {};
    mapa[token] = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(mapa));
    window.dispatchEvent(new CustomEvent("sos-chat-update", { detail: { token } }));
  } catch {}
}

export function obterNaoLidas(token: string, papel: "tecnico" | "cliente" = "tecnico"): number {
  if (!token) return 0;
  try {
    const mensagens = lerChatLocal(token);
    if (!mensagens || mensagens.length === 0) return 0;

    const keyLido = `sos_chat_lido_${papel}`;
    const salvoLido = localStorage.getItem(keyLido);
    const mapaLido = salvoLido ? JSON.parse(salvoLido) : {};
    const ultimoLidoISO = mapaLido[token];
    const ultimoLidoTime = ultimoLidoISO ? new Date(ultimoLidoISO).getTime() : 0;

    // Se sou o técnico, as mensagens que contam como não lidas são as enviadas pelo cliente
    const remetenteEsperado = papel === "tecnico" ? "cliente" : "tecnico";
    const remetenteProprio = papel === "tecnico" ? "tecnico" : "cliente";

    // Qualquer mensagem enviada por mim mesmo indica que eu já li o histórico até aquele momento
    const msgsProprias = mensagens
      .filter((m) => m.remetente === remetenteProprio)
      .map((m) => new Date(m.dataISO).getTime());
    const ultimaRespostaTime = msgsProprias.length > 0 ? Math.max(...msgsProprias) : 0;
    const tempoCorte = Math.max(ultimoLidoTime, ultimaRespostaTime);

    const naoLidas = mensagens.filter((m) => {
      if (m.remetente !== remetenteEsperado) return false;
      const msgTime = new Date(m.dataISO).getTime();
      return msgTime > tempoCorte;
    });

    return naoLidas.length;
  } catch {
    return 0;
  }
}

export function obterTotalNaoLidas(papel: "tecnico" | "cliente" = "tecnico"): number {
  try {
    const salvo = localStorage.getItem(CHAT_LOCAL);
    if (!salvo) return 0;
    const mapa = JSON.parse(salvo);
    let total = 0;
    Object.keys(mapa).forEach((tok) => {
      total += obterNaoLidas(tok, papel);
    });
    return total;
  } catch {
    return 0;
  }
}

export function tocarSomNotificacao() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Nota Ré5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // Nota Lá5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

let globalSyncIniciado = false;

export function iniciarSyncChatGlobal() {
  if (typeof window === "undefined" || globalSyncIniciado) return () => {};
  globalSyncIniciado = true;

  let primeiroCarregamento = true;

  try {
    const chatRootRef = ref(database, CHAT_PATH);
    const unsub = onValue(
      chatRootRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const dados = snapshot.val();
          if (dados && typeof dados === "object") {
            let houveNovasMensagens = false;
            let houveNovaDoCliente = false;

            let chatLocal: Record<string, MensagemChat[]> = {};
            try {
              const salvo = localStorage.getItem(CHAT_LOCAL);
              chatLocal = salvo ? JSON.parse(salvo) : {};
            } catch {}

            Object.keys(dados).forEach((tok) => {
              const msgsObj = dados[tok];
              if (msgsObj && typeof msgsObj === "object") {
                const msgsFirebase: MensagemChat[] = Object.keys(msgsObj).map((k) => ({
                  ...msgsObj[k],
                  id: k,
                }));

                const locais = chatLocal[tok] || [];
                const idLocais = new Set(locais.map((m) => m.id));

                const novas = msgsFirebase.filter((m) => !idLocais.has(m.id));
                if (novas.length > 0) {
                  houveNovasMensagens = true;
                  if (novas.some((m) => m.remetente === "cliente")) {
                    houveNovaDoCliente = true;
                  }
                }

                const mapa = new Map(locais.map((m) => [m.id, m]));
                msgsFirebase.forEach((m) => mapa.set(m.id, m));
                chatLocal[tok] = Array.from(mapa.values()).sort(
                  (a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime()
                );
              }
            });

            if (houveNovasMensagens) {
              try {
                localStorage.setItem(CHAT_LOCAL, JSON.stringify(chatLocal));
              } catch {}
              window.dispatchEvent(new CustomEvent("sos-chat-update"));

              if (!primeiroCarregamento && houveNovaDoCliente) {
                tocarSomNotificacao();
              }
            }
            primeiroCarregamento = false;
          }
        }
      },
      (err) => {
        console.warn("Firebase chat sync aviso:", err);
      }
    );

    return unsub;
  } catch (e) {
    console.warn("Firebase não disponível para sync de chat:", e);
    return () => {};
  }
}

export function useChatNaoLidas(papel: "tecnico" | "cliente" = "tecnico") {
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    const cancelarSync = iniciarSyncChatGlobal();

    const atualizar = () => setVersao((v) => v + 1);
    window.addEventListener("sos-chat-update", atualizar);
    window.addEventListener("storage", atualizar);
    window.addEventListener("focus", atualizar);

    const interval = setInterval(atualizar, 3000);

    return () => {
      cancelarSync?.();
      window.removeEventListener("sos-chat-update", atualizar);
      window.removeEventListener("storage", atualizar);
      window.removeEventListener("focus", atualizar);
      clearInterval(interval);
    };
  }, [papel]);

  const obterContagem = (token: string) => obterNaoLidas(token, papel);
  const totalNaoLidas = obterTotalNaoLidas(papel);

  return { obterContagem, totalNaoLidas, versao };
}

export async function enviarMensagemOS(token: string, texto: string, remetente: "cliente" | "tecnico", anexos: string[] = []): Promise<{ mensagem: MensagemChat; sucesso: boolean }> {
  const nova: MensagemChat = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    texto,
    remetente,
    dataISO: new Date().toISOString(),
    anexos: anexos.length > 0 ? anexos : undefined,
  };

  // Salvar local imediatamente (UX otimista)
  const locais = lerChatLocal(token);
  salvarChatLocal(token, [...locais, nova]);
  marcarChatComoLido(token, remetente);

  // Firebase
  let sucesso = false;
  try {
    const refMensagem = push(ref(database, `${CHAT_PATH}/${token}`));
    nova.id = refMensagem.key || nova.id;
    await set(refMensagem, {
      id: nova.id,
      texto: nova.texto,
      remetente: nova.remetente,
      dataISO: nova.dataISO,
      ...(nova.anexos ? { anexos: nova.anexos } : {}),
    });
    sucesso = true;
  } catch (error) {
    console.warn("Erro ao salvar mensagem no Firebase:", error);
    sucesso = false;
  }
  
  return { mensagem: nova, sucesso };
}

export function escutarMensagensOS(token: string, callback: (mensagens: MensagemChat[]) => void): () => void {
  // 1. Envia as mensagens locais iniciais
  callback(lerChatLocal(token));

  // 2. Sempre ouvir mudanças do localStorage (garante a ponte entre abas no mesmo PC)
  const listenerLocal = (e: StorageEvent) => {
    if (e.key === CHAT_LOCAL) {
      callback(lerChatLocal(token));
    }
  };
  window.addEventListener("storage", listenerLocal);

  const listenerCustom = (e: any) => {
    if (!e.detail?.token || e.detail.token === token) {
      callback(lerChatLocal(token));
    }
  };
  window.addEventListener("sos-chat-update", listenerCustom as EventListener);
  
  // 3. Polling local de segurança (caso o evento de storage não dispare perfeitamente)
  const intervaloLocal = setInterval(() => {
    callback(lerChatLocal(token));
  }, 2000);

  let unsubscribeFirebase = () => {};

  try {
    const chatRef = ref(database, `${CHAT_PATH}/${token}`);
    
    unsubscribeFirebase = onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const dados = snapshot.val();
        const arrayMensagens = Object.keys(dados).map((key) => ({
          ...dados[key],
          id: key,
        }));
        
        const locais = lerChatLocal(token);
        const mapa = new Map(locais.map(m => [m.id, m]));
        
        // Firebase insere ou atualiza
        arrayMensagens.forEach(m => mapa.set(m.id, m));
        
        const finalMsgs = Array.from(mapa.values()).sort((a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime());
        
        // Salva o resultado do merge, preservando mensagens enviadas localmente que ainda não subiram
        salvarChatLocal(token, finalMsgs);
        
        callback(finalMsgs);
      }
    }, (error) => {
      console.warn("Firebase não autorizou leitura do chat ou não há rede.", error);
    });
  } catch (e) {
    console.warn("Sem acesso ao Firebase, operando apenas localmente.");
  }
  
  return () => {
    window.removeEventListener("storage", listenerLocal);
    window.removeEventListener("sos-chat-update", listenerCustom as EventListener);
    clearInterval(intervaloLocal);
    unsubscribeFirebase();
  };
}
