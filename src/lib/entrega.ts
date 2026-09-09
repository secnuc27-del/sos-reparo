import { salvarClienteFirebase, salvarEdicoesFirebase } from "./firebaseSync";
import { tokenOSPublica } from "./osPublica";
import { database } from "./firebase";
import { ref, update } from "firebase/database";

export async function confirmarEntregaComAssinatura(
  numeroOS: string,
  assinaturaBase64: string,
  tokenPublico?: string
) {
  const agoraISO = new Date().toISOString();
  const hoje = new Date().toLocaleDateString("pt-BR");
  const agoraHora = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let clienteAtualizado: any = null;

  // 1. Atualiza sos_clientes
  try {
    const salvo = localStorage.getItem("sos_clientes");
    if (salvo) {
      const todos = JSON.parse(salvo);
      const novos = todos.map((c: any) => {
        const match =
          c.os &&
          (String(c.os.numero) === String(numeroOS) ||
            String(c.id) === String(numeroOS) ||
            `OS-${c.id}` === String(numeroOS) ||
            `local-${c.id}` === String(numeroOS));

        if (match) {
          clienteAtualizado = {
            ...c,
            os: {
              ...c.os,
              statusOS: "Entregue",
              assinaturaEntrega: assinaturaBase64,
              assinaturaEm: agoraISO,
              dataRetirada: hoje,
              horaRetirada: agoraHora,
            },
          };
          return clienteAtualizado;
        }
        return c;
      });

      localStorage.setItem("sos_clientes", JSON.stringify(novos));
      if (clienteAtualizado) {
        void salvarClienteFirebase(clienteAtualizado);
      }
    }
  } catch (e) {
    console.warn("Erro ao atualizar sos_clientes com assinatura:", e);
  }

  // 2. Atualiza sos_eq_static_edits
  try {
    const staticSalvo = localStorage.getItem("sos_eq_static_edits");
    const edicoes: Record<string, any> = staticSalvo ? JSON.parse(staticSalvo) : {};

    const chaves = Object.keys(edicoes);
    const numSemPrefixo = numeroOS.replace(/^OS-/i, "");
    const keyMatch =
      chaves.find(
        (k) =>
          k === numeroOS ||
          k === numSemPrefixo ||
          `OS-${k}` === numeroOS ||
          numeroOS.includes(k)
      ) || numeroOS;

    const payloadEdicao = {
      ...(edicoes[keyMatch] || {}),
      status: "Entregue",
      assinaturaEntrega: assinaturaBase64,
      assinaturaEm: agoraISO,
      dataRetirada: hoje,
      horaRetirada: agoraHora,
    };

    edicoes[keyMatch] = payloadEdicao;
    edicoes[numeroOS] = payloadEdicao;
    if (numSemPrefixo !== numeroOS) {
      edicoes[numSemPrefixo] = payloadEdicao;
    }

    localStorage.setItem("sos_eq_static_edits", JSON.stringify(edicoes));
    void salvarEdicoesFirebase(edicoes);
  } catch (e) {
    console.warn("Erro ao atualizar sos_eq_static_edits com assinatura:", e);
  }

  // 3. Atualiza publicOS no Firebase e localStorage
  const tokenFinal = tokenPublico || tokenOSPublica(numeroOS);
  const tokenNorm = tokenOSPublica(numeroOS);
  const payloadPublico = {
    status: "Entregue",
    assinaturaEntrega: assinaturaBase64,
    assinaturaEm: agoraISO,
    dataRetirada: hoje,
    atualizadaEm: agoraISO,
  };

  try {
    const publicSalvo = localStorage.getItem("sos_public_os");
    const mapaPublico = publicSalvo ? JSON.parse(publicSalvo) : {};

    mapaPublico[tokenFinal] = {
      ...(mapaPublico[tokenFinal] || {}),
      ...payloadPublico,
    };

    if (tokenNorm && tokenNorm !== tokenFinal) {
      mapaPublico[tokenNorm] = {
        ...(mapaPublico[tokenNorm] || {}),
        ...payloadPublico,
      };
    }

    localStorage.setItem("sos_public_os", JSON.stringify(mapaPublico));
  } catch (e) {
    console.warn("Erro ao atualizar cache local publicOS:", e);
  }

  // 4. Notifica todas as abas e componentes imediatamente
  window.dispatchEvent(new CustomEvent("sos-firebase-update"));
  window.dispatchEvent(new Event("storage"));

  // 5. Atualiza Firebase em segundo plano com timeout de segurança (máx 2.5s)
  try {
    const tarefas = [
      update(ref(database, `publicOS/${tokenFinal}`), payloadPublico),
    ];
    if (tokenNorm && tokenNorm !== tokenFinal) {
      tarefas.push(update(ref(database, `publicOS/${tokenNorm}`), payloadPublico));
    }

    await Promise.race([
      Promise.allSettled(tarefas),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch (e) {
    console.warn("Aviso na atualização remota da publicOS:", e);
  }
}
