import { get, onValue, ref, set, update, type Unsubscribe } from "firebase/database";
import { database } from "./firebase";
import { clientes as clientesIniciais } from "./dados";
import { mesclarAprovacoesPublicas, sincronizarOSPublicas, type PublicOSRecord } from "./osPublica";

const CLIENTES_STORAGE_KEY = "sos_clientes";
const EDICOES_STORAGE_KEY = "sos_eq_static_edits";
const CLIENTES_PATH = "clientes";
const EDICOES_PATH = "equipamentosEdicoes";
const PUBLIC_PATH = "publicOS";

let inicializacao: Promise<unknown[]> | null = null;
let listeners: Unsubscribe[] = [];
const CLIENTES_PENDENTES_STORAGE_KEY = 'sos_clientes_pendentes';
const FIREBASE_TIMEOUT_MS = 10_000;

export type FirebaseStatus = "conectando" | "conectado" | "offline";
let statusAtual: FirebaseStatus = "conectando";

function lerLocal<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function compactarClienteParaCache(cliente: unknown, removerFotos = false) {
  if (!cliente || typeof cliente !== 'object') return cliente;

  const registro = cliente as Record<string, unknown>;
  const os = registro.os;
  if (!os || typeof os !== 'object') return { ...registro };

  const dadosOS = os as Record<string, unknown>;
  const fotoEquipamento = removerFotos ? '' : dadosOS.fotoEquipamento;
  const fotoAntes = removerFotos || dadosOS.fotoAntes === dadosOS.fotoEquipamento
    ? ''
    : dadosOS.fotoAntes;
  const fotoDepois = removerFotos ? '' : dadosOS.fotoDepois;

  return {
    ...registro,
    os: {
      ...dadosOS,
      fotoEquipamento,
      fotoAntes,
      fotoDepois,
    },
  };
}

function compactarClientesParaCache(clientes: unknown[], removerFotos = false) {
  return clientes.map((cliente) => compactarClienteParaCache(cliente, removerFotos));
}

function gravarLocal(key: string, value: unknown) {
  const valorInicial = key === CLIENTES_STORAGE_KEY && Array.isArray(value)
    ? compactarClientesParaCache(value)
    : value;

  try {
    localStorage.setItem(key, JSON.stringify(valorInicial));
    return true;
  } catch {
    // Fotos podem ocupar toda a cota do navegador. Mantemos os dados da OS
    // e removemos apenas as imagens da cópia local; o Firebase continua com
    // o registro completo e compartilhado entre os dispositivos.
    return false;
  }
}

function avisarAtualizacao(clientes?: unknown[]) {
  window.dispatchEvent(new CustomEvent("sos-firebase-update", {
    detail: clientes,
  }));
}

function avisarStatus(status: FirebaseStatus) {
  statusAtual = status;
  window.dispatchEvent(new CustomEvent("sos-firebase-status", {
    detail: status,
  }));
}

export function obterStatusFirebase() {
  return statusAtual;
}

function comPrazo<T>(promessa: Promise<T>, mensagem: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const temporizador = window.setTimeout(() => reject(new Error(mensagem)), FIREBASE_TIMEOUT_MS);
    promessa.then(
      (valor) => {
        window.clearTimeout(temporizador);
        resolve(valor);
      },
      (erro) => {
        window.clearTimeout(temporizador);
        reject(erro);
      },
    );
  });
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

function adicionarLocaisNaoRemotos(clientesRemotos: unknown[], clientesLocais: unknown[]) {
  const chavesRemotas = new Set(clientesRemotos.map(chaveCliente));
  const locaisNovos = clientesLocais.filter((cliente) => !chavesRemotas.has(chaveCliente(cliente)));
  return [...clientesRemotos, ...locaisNovos];
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

async function prepararDadosIniciais(): Promise<unknown[]> {
  const clientesRef = ref(database, CLIENTES_PATH);
  const clientesSnapshot = await comPrazo(
    get(clientesRef),
    "Firebase demorou demais para responder aos clientes.",
  );
  const clientesPendentes = lerClientesPendentes();
  let clientesParaUsar: unknown[];

  if (clientesSnapshot.exists()) {
    const clientesRemotos = normalizarArray(clientesSnapshot.val());
    const clientesLocais = lerLocal<unknown[]>(CLIENTES_STORAGE_KEY) ?? [];
    const pendentes = pendentesQueNaoVieram(clientesRemotos, clientesPendentes);
    const baseComPendentes = adicionarPendentes(clientesRemotos, pendentes);
    clientesParaUsar = adicionarLocaisNaoRemotos(baseComPendentes, clientesLocais);
    gravarLocal(CLIENTES_STORAGE_KEY, clientesParaUsar);
    if (clientesParaUsar.length > clientesRemotos.length) {
      await set(clientesRef, clientesParaUsar);
    }
    if (pendentes.length === 0 && clientesPendentes.length > 0) limparClientesPendentes();
    else if (pendentes.length > 0) gravarClientesPendentes(pendentes);
  } else {
    const clientesLocais = lerLocal<unknown[]>(CLIENTES_STORAGE_KEY) ?? clientesIniciais;
    clientesParaUsar = adicionarPendentes(clientesLocais, clientesPendentes);
    gravarLocal(CLIENTES_STORAGE_KEY, clientesParaUsar);
    await set(clientesRef, clientesParaUsar);
  }

  const edicoesRef = ref(database, EDICOES_PATH);
  const edicoesSnapshot = await comPrazo(
    get(edicoesRef),
    "Firebase demorou demais para responder às edições.",
  );
  if (edicoesSnapshot.exists()) {
    const edicoesRemotas = edicoesSnapshot.val() as Record<string, unknown>;
    const edicoesLocais = lerLocal<Record<string, unknown>>(EDICOES_STORAGE_KEY) ?? {};
    const edicoesMescladas = { ...edicoesLocais, ...edicoesRemotas };
    gravarLocal(EDICOES_STORAGE_KEY, edicoesMescladas);
    const existemEdicoesLocaisNovas = Object.keys(edicoesLocais).some((chave) => !(chave in edicoesRemotas));
    if (existemEdicoesLocaisNovas) await set(edicoesRef, edicoesMescladas);
  } else {
    const edicoesLocais = lerLocal<Record<string, unknown>>(EDICOES_STORAGE_KEY);
    if (edicoesLocais) await set(edicoesRef, edicoesLocais);
  }

  return clientesParaUsar;
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
        const clientesProtegidos = adicionarPendentes(clientesRemotos, pendentes);
        gravarLocal(CLIENTES_STORAGE_KEY, clientesProtegidos);
        gravarClientesPendentes(pendentes);
        avisarAtualizacao(clientesProtegidos);
        return;
      }

      if (clientesPendentes.length > 0) limparClientesPendentes();
      gravarLocal(CLIENTES_STORAGE_KEY, clientesRemotos);
      avisarAtualizacao(clientesRemotos);
      avisarStatus("conectado");
    }, (error) => {
      avisarStatus("offline");
      console.warn("Firebase clientes indisponível:", error.message);
    }),
    onValue(ref(database, EDICOES_PATH), (snapshot) => {
      if (!snapshot.exists()) return;
      gravarLocal(EDICOES_STORAGE_KEY, snapshot.val());
      avisarAtualizacao();
    }, (error) => {
      avisarStatus("offline");
      console.warn("Firebase edições indisponível:", error.message);
    }),
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
    }, (error) => {
      console.warn("Firebase público indisponível:", error.message);
    }),
  ];
}

export function iniciarSincronizacaoFirebase() {
  if (!inicializacao) {
    avisarStatus("conectando");
    inicializacao = prepararDadosIniciais()
      .then((clientesSincronizados) => {
        avisarStatus("conectado");
        return clientesSincronizados;
      })
      .catch((error: unknown) => {
        avisarStatus("offline");
        console.warn("Firebase indisponível; usando dados locais:", error);
        return lerLocal<unknown[]>(CLIENTES_STORAGE_KEY) ?? clientesIniciais;
      })
      .then((clientesSincronizados) => {
        iniciarListeners();
        return clientesSincronizados;
      });
  }
  return inicializacao;
}

export function salvarClientesLocal(clientes: unknown[]) {
  return gravarLocal(CLIENTES_STORAGE_KEY, clientes);
}

async function salvarClientesPorRegistro(clientes: unknown[]) {
  const registros = clientes.filter((cliente): cliente is Record<string, unknown> => {
    if (!cliente || typeof cliente !== 'object') return false;
    const id = (cliente as Record<string, unknown>).id;
    return id !== undefined && id !== null;
  });

  if (registros.length === 0) return;

  const clientesRef = ref(database, CLIENTES_PATH);
  const snapshot = await comPrazo(
    get(clientesRef),
    "Firebase demorou demais para salvar o cliente.",
  );
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
    avisarStatus("conectado");
    return true;
  } catch (error) {
    avisarStatus("offline");
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
    avisarStatus("offline");
    console.warn("Não foi possível salvar clientes no Firebase:", error);
  }
}

export async function salvarEdicoesFirebase(edicoes: unknown) {
  await iniciarSincronizacaoFirebase();
  try {
    await set(ref(database, EDICOES_PATH), edicoes as object);
  } catch (error) {
    avisarStatus("offline");
    console.warn("Não foi possível salvar edições no Firebase:", error);
  }
}
