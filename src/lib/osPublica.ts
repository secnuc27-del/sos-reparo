import { get, ref, set, update } from "firebase/database";
import { database } from "./firebase";

import { ordensDeServico, equipamentos } from "./dados";

export type AprovacaoOrcamento = "pendente" | "aprovado" | "recusado";

export type PublicOSRecord = {
  token: string;
  numero: string;
  cliente: string;
  equipamento: string;
  tipo: string;
  servico: string;
  tecnico: string;
  status: string;
  valor: string;
  dataEntrada: string;
  previsao: string;
  dataRetirada: string;
  fotoAntes: string;
  fotoDepois: string;
  defeito: string;
  aprovacaoOrcamento: AprovacaoOrcamento;
  assinaturaEntrega: boolean | string;
  assinaturaEm: string;
  atualizadaEm: string;
};

const PUBLIC_STORAGE_KEY = "sos_public_os";
const PUBLIC_PATH = "publicOS";
const FIREBASE_DATABASE_URL = "https://sos-reparo-12345-default-rtdb.firebaseio.com";

function lerMapaLocal(): Record<string, PublicOSRecord> {
  try {
    const salvo = localStorage.getItem(PUBLIC_STORAGE_KEY);
    return salvo ? JSON.parse(salvo) : {};
  } catch {
    return {};
  }
}

function salvarMapaLocal(mapa: Record<string, PublicOSRecord>) {
  try {
    localStorage.setItem(PUBLIC_STORAGE_KEY, JSON.stringify(mapa));
  } catch {
    // O Firebase continua sendo a fonte compartilhada quando o localStorage falhar.
  }
}

async function buscarOSPublicaPorREST(chave: string): Promise<PublicOSRecord | null> {
  const controlador = new AbortController();
  const temporizador = window.setTimeout(() => controlador.abort(), 2500);

  try {
    const resposta = await fetch(
      `${FIREBASE_DATABASE_URL}/${PUBLIC_PATH}/${encodeURIComponent(chave)}.json`,
      { cache: "no-store", signal: controlador.signal },
    );

    if (!resposta.ok) return null;
    const dados = await resposta.json();
    return dados && typeof dados === "object" ? dados as PublicOSRecord : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(temporizador);
  }
}

export function gerarTokenOS(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 18);
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function tokenOSPublica(numero: string, token?: string): string {
  if (token) return token;
  const limpo = String(numero || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // Evita duplicações como "os-os-2026-0142"
  return limpo.startsWith("os-") ? limpo : `os-${limpo}`;
}

export function urlOSPublica(token: string): string {
  return `${window.location.origin}${window.location.pathname}#/acompanhar/${encodeURIComponent(token)}`;
}

export function criarRegistroOSPublica(os: any, token?: string): PublicOSRecord {
  const numero = String(os.numero || os.numeroOS || "OS");
  const statusOS = String(os.status || os.statusOS || "Aguardando");
  const isEntregue = statusOS === "Entregue";

  return {
    token: tokenOSPublica(numero, os.publicToken || token),
    numero,
    cliente: String(os.cliente || "Cliente"),
    equipamento: String(os.equipamento || `${os.marca || ""} ${os.modelo || ""}`).trim(),
    tipo: String(os.tipo || os.tipoAparel || "Aparelho"),
    servico: String(os.servico || "Análise técnica"),
    tecnico: String(os.tecnico || "Equipe SOS Reparo"),
    status: statusOS,
    valor: String(os.valor || "A orçar"),
    dataEntrada: String(os.abertura || os.dataEntrada || ""),
    previsao: String(os.previsao || os.dataRetirada || ""),
    dataRetirada: String(os.dataRetirada || ""),
    fotoAntes: String(os.fotoAntes || os.fotoEquipamento || ""),
    fotoDepois: String(os.fotoDepois || ""),
    defeito: String(os.defeito || ""),
    aprovacaoOrcamento: os.aprovacaoOrcamento || "pendente",
    assinaturaEntrega: isEntregue ? (os.assinaturaEntrega || true) : false,
    assinaturaEm: isEntregue ? String(os.assinaturaEm || "") : "",
    atualizadaEm: new Date().toISOString(),
  };
}

export async function salvarOSPublica(registro: PublicOSRecord) {
  const mapa = lerMapaLocal();
  const existente = mapa[registro.token];
  
  if (existente) {
    if (existente.aprovacaoOrcamento && existente.aprovacaoOrcamento !== "pendente" && registro.aprovacaoOrcamento === "pendente") {
      registro.aprovacaoOrcamento = existente.aprovacaoOrcamento;
    }
    // Preserva assinatura existente SOMENTE se o novo status ainda for "Entregue"
    if (registro.status === "Entregue" && existente.assinaturaEntrega && !registro.assinaturaEntrega) {
      registro.assinaturaEntrega = existente.assinaturaEntrega;
      registro.assinaturaEm = existente.assinaturaEm;
    }
  }

  // Se o status NÃO for "Entregue", cancela e limpa a assinatura de entrega
  if (registro.status !== "Entregue") {
    registro.assinaturaEntrega = false;
    registro.assinaturaEm = "";
  }

  const anteriorStr = JSON.stringify(mapa[registro.token]);
  const novoStr = JSON.stringify(registro);

  mapa[registro.token] = registro;
  const tokenNorm = tokenOSPublica(registro.numero);
  if (tokenNorm !== registro.token) {
    mapa[tokenNorm] = registro;
  }

  if (anteriorStr !== novoStr) {
    salvarMapaLocal(mapa);
  }

  try {
    await set(ref(database, `${PUBLIC_PATH}/${registro.token}`), registro);
    if (tokenNorm !== registro.token) {
      void set(ref(database, `${PUBLIC_PATH}/${tokenNorm}`), registro).catch(() => {});
    }
  } catch (error) {
    console.warn("Não foi possível publicar a OS no Firebase:", error);
  }
}

function gerarChavesCandidatas(token: string): string[] {
  const t = String(token || "").trim();
  const c = new Set<string>();
  if (!t) return [];
  c.add(t);
  c.add(t.toLowerCase());

  if (/^os-os-/i.test(t)) {
    c.add(t.replace(/^os-os-/i, "os-"));
    c.add(t.replace(/^os-os-/i, "OS-"));
  }

  if (/^os-/i.test(t)) {
    const semOs = t.replace(/^os-+/i, "");
    c.add(semOs);
    c.add(`OS-${semOs}`);
    c.add(`os-os-${semOs}`);
  } else {
    c.add(`os-${t.toLowerCase()}`);
  }

  return Array.from(c);
}

export async function buscarOSPublica(token: string): Promise<PublicOSRecord | null> {
  const candidatos = gerarChavesCandidatas(token);

  // A leitura REST sem cache funciona como fallback para celulares em que
  // o SDK do Firebase fica suspenso ou bloqueado pelo navegador.
  for (const chave of candidatos) {
    const registro = await buscarOSPublicaPorREST(chave);
    if (registro) {
      const mapa = lerMapaLocal();
      mapa[token] = registro;
      mapa[registro.token] = registro;
      salvarMapaLocal(mapa);
      return registro;
    }
  }

  // 1. Tenta buscar no Firebase em tempo hábil (timeout de 2.5s)
  for (const chave of candidatos) {
    try {
      const snapshot = await Promise.race([
        get(ref(database, `${PUBLIC_PATH}/${chave}`)),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
      ]);

      if (snapshot && snapshot.exists()) {
        const registro = snapshot.val() as PublicOSRecord;
        const mapa = lerMapaLocal();
        mapa[token] = registro;
        mapa[registro.token] = registro;
        salvarMapaLocal(mapa);
        return registro;
      }
    } catch {
      // continua para o próximo candidato
    }
  }

  // 2. Busca no mapa público local
  const mapa = lerMapaLocal();
  for (const chave of candidatos) {
    if (mapa[chave]) {
      return mapa[chave];
    }
  }

  // 3. Busca nas OSs salvas em sos_clientes
  try {
    const clientesSalvos = localStorage.getItem("sos_clientes");
    if (clientesSalvos) {
      const lista = JSON.parse(clientesSalvos);
      for (const item of lista) {
        if (!item?.os) continue;
        const osNum = String(item.os.numero || "");
        const osTok = String(item.os.publicToken || "");
        if (
          candidatos.includes(osTok) ||
          candidatos.includes(osNum) ||
          candidatos.includes(tokenOSPublica(osNum))
        ) {
          return criarRegistroOSPublica({
            ...item.os,
            cliente: item.nome,
            equipamento: `${item.os.marca || ""} ${item.os.modelo || ""}`.trim(),
            publicToken: item.os.publicToken || token,
          }, token);
        }
      }
    }
  } catch {}

  // 4. Fallback para OSs padrão/iniciais (ex: celular abrindo OS-2026-0142 pela primeira vez)
  const ordemEstatica = ordensDeServico.find((o) => {
    const num = String(o.numero);
    const tok = tokenOSPublica(num);
    return (
      candidatos.includes(num) ||
      candidatos.includes(tok) ||
      candidatos.includes(`os-os-${num.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`) ||
      candidatos.some((c) => num.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(num.toLowerCase()))
    );
  });

  if (ordemEstatica) {
    let staticEdits: Record<string, any> = {};
    try {
      const staticSalvo = localStorage.getItem("sos_eq_static_edits");
      if (staticSalvo) staticEdits = JSON.parse(staticSalvo);
    } catch {}

    const eq = equipamentos.find(
      (e) =>
        e.codigoCliente === ordemEstatica.codigoCliente ||
        `${e.marca} ${e.modelo}`.trim() === ordemEstatica.equipamento
    );

    const edit =
      (eq ? staticEdits[eq.id] : null) ||
      staticEdits[ordemEstatica.numero] ||
      staticEdits[ordemEstatica.numero.replace(/^OS-/i, "")] ||
      {};

    const statusFinal = edit.status || ordemEstatica.status;
    const isEntregue = statusFinal === "Entregue";

    const registro: PublicOSRecord = {
      token: tokenOSPublica(ordemEstatica.numero),
      numero: ordemEstatica.numero,
      cliente: ordemEstatica.cliente,
      equipamento: ordemEstatica.equipamento,
      tipo: eq?.tipo || "Aparelho",
      servico: ordemEstatica.servico,
      tecnico: ordemEstatica.tecnico,
      status: statusFinal,
      valor: edit.valor || ordemEstatica.valor,
      dataEntrada: ordemEstatica.etapas?.[0]?.data?.split(" ")[0] || "20/08/2026",
      previsao: ordemEstatica.previsao,
      dataRetirada: edit.dataRetirada || "",
      fotoAntes: edit.fotoAntes || "",
      fotoDepois: edit.fotoDepois || "",
      defeito: eq?.defeito || ordemEstatica.servico,
      aprovacaoOrcamento: edit.aprovacaoOrcamento || "pendente",
      assinaturaEntrega: isEntregue ? (edit.assinaturaEntrega || true) : false,
      assinaturaEm: isEntregue ? (edit.assinaturaEm || "") : "",
      atualizadaEm: new Date().toISOString(),
    };

    mapa[token] = registro;
    mapa[registro.token] = registro;
    salvarMapaLocal(mapa);

    return registro;
  }

  return null;
}

export async function atualizarAprovacaoOS(token: string, aprovacaoOrcamento: AprovacaoOrcamento) {
  const mapa = lerMapaLocal();
  const atual = mapa[token];
  if (atual) {
    mapa[token] = { ...atual, aprovacaoOrcamento, atualizadaEm: new Date().toISOString() };
    salvarMapaLocal(mapa);
  }
  try {
    await update(ref(database, `${PUBLIC_PATH}/${token}`), {
      aprovacaoOrcamento,
      atualizadaEm: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Não foi possível registrar a aprovação no Firebase:", error);
  }
}

export async function sincronizarOSPublicas(clientes: any[]) {
  const mapa = lerMapaLocal();

  const registros = clientes
    .filter((cliente) => cliente?.os)
    .map((cliente) => {
      const registro = criarRegistroOSPublica({
        ...cliente.os,
        cliente: cliente.nome,
        equipamento: `${cliente.os.marca} ${cliente.os.modelo}`.trim(),
        publicToken: cliente.os.publicToken,
      }, cliente.os.publicToken);

      // Preservar aprovação existente na nuvem
      if (mapa[registro.token] && mapa[registro.token].aprovacaoOrcamento && mapa[registro.token].aprovacaoOrcamento !== "pendente") {
        registro.aprovacaoOrcamento = mapa[registro.token].aprovacaoOrcamento;
      }
      return registro;
    });

  registros.forEach((registro) => { mapa[registro.token] = registro; });
  salvarMapaLocal(mapa);

  await Promise.all(registros.map(async (registro) => {
    try {
      await set(ref(database, `${PUBLIC_PATH}/${registro.token}`), registro);
    } catch (error) {
      console.warn("Não foi possível sincronizar uma OS pública:", error);
    }
  }));
}

export function mesclarAprovacoesPublicas(clientes: any[], mapaPublico: Record<string, PublicOSRecord>) {
  let mudou = false;
  const atualizados = clientes.map((cliente) => {
    if (!cliente?.os?.numero) return cliente;
    const token = tokenOSPublica(cliente.os.numero, cliente.os.publicToken);
    const publico = mapaPublico[token];
    if (!publico || publico.aprovacaoOrcamento === cliente.os.aprovacaoOrcamento) return cliente;
    mudou = true;
    return { ...cliente, os: { ...cliente.os, publicToken: token, aprovacaoOrcamento: publico.aprovacaoOrcamento } };
  });
  return mudou ? atualizados : clientes;
}

export function mapaOSPublicasLocal() {
  return lerMapaLocal();
}
