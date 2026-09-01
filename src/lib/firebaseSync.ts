import { get, onValue, ref, set, type Unsubscribe } from "firebase/database";
import { database } from "./firebase";
import { clientes as clientesIniciais } from "./dados";
import { mesclarAprovacoesPublicas, sincronizarOSPublicas, type PublicOSRecord } from "./osPublica";

const CLIENTES_STORAGE_KEY = "sos_clientes";
const EDICOES_STORAGE_KEY = "sos_eq_static_edits";
const CLIENTES_PATH = "clientes";
const EDICOES_PATH = "equipamentosEdicoes";
const PUBLIC_PATH = "publicOS";

let inicializacao: Promise<void> | null = null;
let listeners: Unsubscribe[] = [];

function lerLocal<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function gravarLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // O localStorage permanece apenas como fallback do Firebase.
  }
}

function avisarAtualizacao() {
  window.dispatchEvent(new Event("sos-firebase-update"));
}

function normalizarArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

async function prepararDadosIniciais() {
  const clientesRef = ref(database, CLIENTES_PATH);
  const clientesSnapshot = await get(clientesRef);

  if (clientesSnapshot.exists()) {
    gravarLocal(CLIENTES_STORAGE_KEY, normalizarArray(clientesSnapshot.val()));
  } else {
    const clientesLocais = lerLocal<unknown[]>(CLIENTES_STORAGE_KEY) ?? clientesIniciais;
    gravarLocal(CLIENTES_STORAGE_KEY, clientesLocais);
    await set(clientesRef, clientesLocais);
  }

  const edicoesRef = ref(database, EDICOES_PATH);
  const edicoesSnapshot = await get(edicoesRef);
  if (edicoesSnapshot.exists()) {
    gravarLocal(EDICOES_STORAGE_KEY, edicoesSnapshot.val());
  } else {
    const edicoesLocais = lerLocal<Record<string, unknown>>(EDICOES_STORAGE_KEY);
    if (edicoesLocais) await set(edicoesRef, edicoesLocais);
  }
}

function iniciarListeners() {
  listeners.forEach((unsubscribe) => unsubscribe());
  listeners = [
    onValue(ref(database, CLIENTES_PATH), (snapshot) => {
      if (!snapshot.exists()) return;
      gravarLocal(CLIENTES_STORAGE_KEY, normalizarArray(snapshot.val()));
      avisarAtualizacao();
    }, (error) => console.warn("Firebase clientes indisponível:", error.message)),
    onValue(ref(database, EDICOES_PATH), (snapshot) => {
      if (!snapshot.exists()) return;
      gravarLocal(EDICOES_STORAGE_KEY, snapshot.val());
      avisarAtualizacao();
    }, (error) => console.warn("Firebase edições indisponível:", error.message)),
    onValue(ref(database, PUBLIC_PATH), (snapshot) => {
      if (!snapshot.exists()) return;
      const mapaPublico = snapshot.val() as Record<string, PublicOSRecord>;
      const clientesLocais = lerLocal<any[]>(CLIENTES_STORAGE_KEY);
      if (clientesLocais) {
        const atualizados = mesclarAprovacoesPublicas(clientesLocais, mapaPublico);
        if (atualizados !== clientesLocais) gravarLocal(CLIENTES_STORAGE_KEY, atualizados);
      }
      avisarAtualizacao();
    }, (error) => console.warn("Firebase público indisponível:", error.message)),
  ];
}

export function iniciarSincronizacaoFirebase() {
  if (!inicializacao) {
    inicializacao = prepararDadosIniciais()
      .catch((error: unknown) => {
        console.warn("Firebase indisponível; usando dados locais:", error);
      })
      .then(() => {
        iniciarListeners();
      });
  }
  return inicializacao;
}

export async function salvarClientesFirebase(clientes: unknown) {
  await iniciarSincronizacaoFirebase();
  try {
    await set(ref(database, CLIENTES_PATH), clientes as object);
    if (Array.isArray(clientes)) await sincronizarOSPublicas(clientes);
  } catch (error) {
    console.warn("Não foi possível salvar clientes no Firebase:", error);
  }
}

export async function salvarEdicoesFirebase(edicoes: unknown) {
  await iniciarSincronizacaoFirebase();
  try {
    await set(ref(database, EDICOES_PATH), edicoes as object);
  } catch (error) {
    console.warn("Não foi possível salvar edições no Firebase:", error);
  }
}
