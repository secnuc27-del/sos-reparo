import { get, ref, set, update } from "firebase/database";
import { database } from "./firebase";

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
  assinaturaEntrega: boolean;
  assinaturaEm: string;
  atualizadaEm: string;
};

const PUBLIC_STORAGE_KEY = "sos_public_os";
const PUBLIC_PATH = "publicOS";

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

export function gerarTokenOS(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 18);
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function tokenOSPublica(numero: string, token?: string): string {
  return token || `os-${String(numero).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function urlOSPublica(token: string): string {
  return `${window.location.origin}${window.location.pathname}#/acompanhar/${encodeURIComponent(token)}`;
}

export function criarRegistroOSPublica(os: any, token?: string): PublicOSRecord {
  const numero = String(os.numero || "OS");
  return {
    token: tokenOSPublica(numero, os.publicToken),
    numero,
    cliente: String(os.cliente || "Cliente"),
    equipamento: String(os.equipamento || `${os.marca || ""} ${os.modelo || ""}`).trim(),
    tipo: String(os.tipo || os.tipoAparel || "Aparelho"),
    servico: String(os.servico || "Análise técnica"),
    tecnico: String(os.tecnico || "Equipe SOS Reparo"),
    status: String(os.status || os.statusOS || "Aguardando"),
    valor: String(os.valor || "A orçar"),
    dataEntrada: String(os.abertura || os.dataEntrada || ""),
    previsao: String(os.previsao || os.dataRetirada || ""),
    dataRetirada: String(os.dataRetirada || ""),
    fotoAntes: String(os.fotoAntes || os.fotoEquipamento || ""),
    fotoDepois: String(os.fotoDepois || ""),
    defeito: String(os.defeito || ""),
    aprovacaoOrcamento: os.aprovacaoOrcamento || "pendente",
    assinaturaEntrega: Boolean(os.assinaturaEntrega),
    assinaturaEm: String(os.assinaturaEm || ""),
    atualizadaEm: new Date().toISOString(),
  };
}

export async function salvarOSPublica(registro: PublicOSRecord) {
  const mapa = lerMapaLocal();
  mapa[registro.token] = registro;
  salvarMapaLocal(mapa);
  try {
    await set(ref(database, `${PUBLIC_PATH}/${registro.token}`), registro);
  } catch (error) {
    console.warn("Não foi possível publicar a OS no Firebase:", error);
  }
}

export async function buscarOSPublica(token: string): Promise<PublicOSRecord | null> {
  try {
    const snapshot = await get(ref(database, `${PUBLIC_PATH}/${token}`));
    if (snapshot.exists()) {
      const registro = snapshot.val() as PublicOSRecord;
      const mapa = lerMapaLocal();
      mapa[token] = registro;
      salvarMapaLocal(mapa);
      return registro;
    }
  } catch (error) {
    console.warn("Firebase indisponível para consulta pública:", error);
  }
  return lerMapaLocal()[token] || null;
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
  const registros = clientes
    .filter((cliente) => cliente?.os)
    .map((cliente) => criarRegistroOSPublica({
      ...cliente.os,
      cliente: cliente.nome,
      equipamento: `${cliente.os.marca} ${cliente.os.modelo}`.trim(),
      publicToken: cliente.os.publicToken,
    }, cliente.os.publicToken));

  const mapa = lerMapaLocal();
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
