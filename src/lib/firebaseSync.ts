import { get, onValue, ref, set, update, type Unsubscribe } from "firebase/database";
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
const CLIENTES_PENDENTES_STORAGE_KEY = 'sos_clientes_pendentes';

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

function chaveCliente(cliente: unknown) {
  if (cliente && typeof cliente === 'object') {
    const registro = cliente as Record<string, unknown>;
    if (registro.id !== undefined && registro.id !== null) return 'id:' + String(registro.id);
    if (registro.codigo !== undefined && registro.codigo !== null) return 'codigo:' + String(registro.codigo);
  }
  return JSON.stringify(cliente);
}

function chavePendente(pendente: unknown) {
  if (pendente && typeof pendente === 'object') return chaveCliente(pendente);
  if (pendente !== undefined && pendente !== null) return 'id:' + String(pendente);
  return JSON.stringify(pendente);
}

function resolverPendente(pendente: unknown, clientesLocais: unknown[]) {
  const chave = chavePendente(pendente);
  return clientesLocais.find((cliente) => chaveCliente(cliente) === chave) ?? pendente;
}

function lerClientesPendentes() {
  const pendentes = lerLocal<unknown>(CLIENTES_PENDENTES_STORAGE_KEY);
  return Array.isArray(pendentes) ? pendentes : [];
}

function gravarClientesPendentes(clientes: unknown[]) {
  gravarLocal(CLIENTES_PENDENTES_STORAGE_KEY, clientes);
}

function limparClientesPendentes() {
  try {
    localStorage.removeItem('sos_clientes_pendentes');
  } catch {
    // O cadastro principal continua salvo no localStorage.
  }
}

function adicionarPendentes(clientesBase: unknown[], pendentes: unknown[]) {
  const clientesLocais = lerLocal<unknown[]>(CLIENTES_STORAGE_KEY) ?? [];
  const pendentesCompletos = pendentes.map((pendente) => resolverPendente(pendente, clientesLocais));
  const chavesBase = new Set(clientesBase.map(chaveCliente));
  return [
    ...pendentesCompletos.filter((cliente) => !chavesBase.has(chaveCliente(cliente))),
    ...clientesBase,
  ];
}

function pendentesQueNaoVieram(clientesRemotos: unknown[], pendentes: unknown[]) {
  const chavesRemotas = new Set(clientesRemotos.map(chaveCliente));
  return pendentes.filter((pendente) => !chavesRemotas.has(chavePendente(pendente)));
}

export function marcarClienteLocalPendente(cliente: unknown) {
  const pendentes = lerClientesPendentes();
  const id = cliente && typeof cliente === 'object'
    ? (cliente as Record<string, unknown>).id
    : undefined;
  const marcador = id !== undefined && id !== null ? { id } : cliente;
  const chave = chavePendente(marcador);
  gravarClientesPendentes([
    marcador,
    ...pendentes.filter((item) => chavePendente(item) !== chave),
  ]);
}

export function existemClientesPendentes() {
  return lerClientesPendentes().length > 0;
}

async function prepararDadosIniciais() {
  const clientesRef = ref(database, CLIENTES_PATH);
  const clientesSnapshot = await get(clientesRef);
  const clientesPendentes = lerClientesPendentes();

  if (clientesSnapshot.exists()) {
    const clientesRemotos = normalizarArray(clientesSnapshot.val());
    const pendentes = pendentesQueNaoVieram(clientesRemotos, clientesPendentes);
    gravarLocal(CLIENTES_STORAGE_KEY, adicionarPendentes(clientesRemotos, pendentes));
    if (pendentes.length === 0 && clientesPendentes.length > 0) limparClientesPendentes();
    else if (pendentes.length > 0) gravarClientesPendentes(pendentes);
  } else {
    const clientesLocais = lerLocal<unknown[]>(CLIENTES_STORAGE_KEY) ?? clientesIniciais;
    const clientesParaUsar = adicionarPendentes(clientesLocais, clientesPendentes);
    gravarLocal(CLIENTES_STORAGE_KEY, clientesParaUsar);
    await set(clientesRef, clientesParaUsar);
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

      const clientesRemotos = normalizarArray(snapshot.val());
      const clientesPendentes = lerClientesPendentes();
      const pendentes = pendentesQueNaoVieram(clientesRemotos, clientesPendentes);

      // Uma resposta antiga do Firebase não pode apagar cliente recém-criado.
      if (pendentes.length > 0) {
        gravarLocal(CLIENTES_STORAGE_KEY, adicionarPendentes(clientesRemotos, pendentes));
        gravarClientesPendentes(pendentes);
        avisarAtualizacao();
        return;
      }

      if (clientesPendentes.length > 0) limparClientesPendentes();
      gravarLocal(CLIENTES_STORAGE_KEY, clientesRemotos);
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
        const clientesPendentes = lerClientesPendentes();
        const baseProtegida = clientesPendentes.length > 0
          ? adicionarPendentes(clientesLocais, clientesPendentes)
          : clientesLocais;
        const atualizados = mesclarAprovacoesPublicas(baseProtegida, mapaPublico);
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

async function salvarClientesPorRegistro(clientes: unknown[]) {
  const registros = clientes.filter((cliente): cliente is Record<string, unknown> => {
    if (!cliente || typeof cliente !== 'object') return false;
    const id = (cliente as Record<string, unknown>).id;
    return id !== undefined && id !== null;
  });

  if (registros.length === 0) return;

  const clientesRef = ref(database, CLIENTES_PATH);
  const snapshot = await get(clientesRef);
  const chavesRemotas = new Map<string, string>();

  if (snapshot.exists()) {
    Object.entries(snapshot.val() as Record<string, unknown>).forEach(([chave, cliente]) => {
      chavesRemotas.set(chaveCliente(cliente), chave);
    });
  }

  const atualizacoes: Record<string, unknown> = {};
  registros.forEach((cliente) => {
    const chave = chavesRemotas.get(chaveCliente(cliente)) || String(cliente.id);
    atualizacoes[chave] = cliente;
  });

  await update(clientesRef, atualizacoes);
}

export async function salvarClienteFirebase(cliente: unknown) {
  if (!cliente || typeof cliente !== 'object') return false;
  const id = (cliente as Record<string, unknown>).id;
  if (id === undefined || id === null) return false;

  try {
    await iniciarSincronizacaoFirebase();
    // Atualiza somente este cliente. A lista inteira nunca mais é sobrescrita
    // durante um cadastro ou uma edição feita em outro aparelho.
    await salvarClientesPorRegistro([cliente]);
    await sincronizarOSPublicas([cliente]);
    return true;
  } catch (error) {
    console.warn('Não foi possível salvar o novo cliente no Firebase:', error);
    return false;
  }
}

export async function salvarClientesPendentesFirebase() {
  const pendentes = lerClientesPendentes();
  const clientesLocais = lerLocal<unknown[]>(CLIENTES_STORAGE_KEY) ?? [];
  for (const cliente of pendentes) {
    await salvarClienteFirebase(resolverPendente(cliente, clientesLocais));
  }
}

export async function salvarClientesFirebase(clientes: unknown) {
  try {
    await iniciarSincronizacaoFirebase();
    const lista = Array.isArray(clientes) ? clientes : [];
    await salvarClientesPorRegistro(lista);
    await sincronizarOSPublicas(lista);
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
