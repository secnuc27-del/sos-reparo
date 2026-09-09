import { ref, set, get, onValue } from "firebase/database";
import { database } from "./firebase";

export type AvaliacaoOS = {
  tokenOS: string;
  numeroOS: string;
  cliente: string;
  equipamento: string;
  estrelas: number; // 1 a 5
  elogio?: string;
  tags?: string[];
  criadaEm: string;
  dataFmt: string;
};

const AVALIACOES_STORAGE_KEY = "sos_avaliacoes";
const AVALIACOES_PATH = "avaliacoes";

export const AVALIACOES_INICIAIS: AvaliacaoOS[] = [
  {
    tokenOS: "seed-1",
    numeroOS: "OS-1001",
    cliente: "Carlos Mendes",
    equipamento: "Dell Inspiron 15",
    estrelas: 5,
    elogio: "Atendimento sensacional! Trocaram a tela no mesmo dia e o notebook ficou zerado.",
    tags: ["Atendimento Rápido ⚡", "Serviço Impecável ✨", "Preço Justo 💰"],
    criadaEm: new Date(Date.now() - 3600000 * 26).toISOString(),
    dataFmt: new Date(Date.now() - 3600000 * 26).toLocaleDateString("pt-BR"),
  },
  {
    tokenOS: "seed-2",
    numeroOS: "OS-1002",
    cliente: "Mariana Souza",
    equipamento: "iPhone 12 Pro",
    estrelas: 5,
    elogio: "Excelente! Troca de bateria rápida com garantia e transparência. Recomendo demais!",
    tags: ["Transparência Total 🛡️", "Recomendo 👍", "Profissional 👨‍🔧"],
    criadaEm: new Date(Date.now() - 3600000 * 18).toISOString(),
    dataFmt: new Date(Date.now() - 3600000 * 18).toLocaleDateString("pt-BR"),
  },
  {
    tokenOS: "seed-3",
    numeroOS: "OS-1003",
    cliente: "Roberto Albuquerque",
    equipamento: "PlayStation 5",
    estrelas: 5,
    elogio: "Limpeza de bancada e troca de metal líquido perfeitas. O videogame não esquenta mais nada.",
    tags: ["Serviço Impecável ✨", "Atendimento Rápido ⚡"],
    criadaEm: new Date(Date.now() - 3600000 * 10).toISOString(),
    dataFmt: new Date(Date.now() - 3600000 * 10).toLocaleDateString("pt-BR"),
  },
  {
    tokenOS: "seed-4",
    numeroOS: "OS-1004",
    cliente: "Juliana Ferreira",
    equipamento: "MacBook Air M1",
    estrelas: 5,
    elogio: "Melhor assistência técnica da cidade. Muito honestos e com acabamento de fábrica!",
    tags: ["Recomendo 👍", "Preço Justo 💰", "Profissional 👨‍🔧"],
    criadaEm: new Date(Date.now() - 3600000 * 5).toISOString(),
    dataFmt: new Date(Date.now() - 3600000 * 5).toLocaleDateString("pt-BR"),
  },
  {
    tokenOS: "seed-5",
    numeroOS: "OS-1005",
    cliente: "Fernando Dias",
    equipamento: "Samsung Galaxy S22",
    estrelas: 4,
    elogio: "Serviço muito bem executado na troca do conector. Aparelho carrega perfeitamente.",
    tags: ["Preço Justo 💰", "Recomendo 👍"],
    criadaEm: new Date(Date.now() - 3600000 * 2).toISOString(),
    dataFmt: new Date(Date.now() - 3600000 * 2).toLocaleDateString("pt-BR"),
  },
  {
    tokenOS: "seed-6",
    numeroOS: "OS-1006",
    cliente: "Aline Castro",
    equipamento: "iPad 9ª Geração",
    estrelas: 5,
    elogio: "Trocaram o vidro mantendo o display original intacto. Ficou impecável!",
    tags: ["Serviço Impecável ✨", "Recomendo 👍"],
    criadaEm: new Date(Date.now() - 3600000 * 1).toISOString(),
    dataFmt: new Date(Date.now() - 3600000 * 1).toLocaleDateString("pt-BR"),
  },
];

export function obterTodasAvaliacoes(): AvaliacaoOS[] {
  let locais: AvaliacaoOS[] = [];
  try {
    const salvo = localStorage.getItem(AVALIACOES_STORAGE_KEY);
    if (salvo) {
      locais = JSON.parse(salvo);
    }
  } catch (e) {
    console.warn("Erro ao ler avaliações locais:", e);
  }

  // Mescla com as sementes iniciais sem duplicar por tokenOS
  const mapa = new Map<string, AvaliacaoOS>();
  AVALIACOES_INICIAIS.forEach((a) => mapa.set(a.tokenOS, a));
  locais.forEach((a) => mapa.set(a.tokenOS, a));

  // Ordena pelas mais recentes primeiro
  return Array.from(mapa.values()).sort(
    (a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime()
  );
}

export function obterAvaliacaoPorToken(tokenOuNumero: string): AvaliacaoOS | null {
  const todas = obterTodasAvaliacoes();
  return (
    todas.find(
      (a) =>
        a.tokenOS === tokenOuNumero ||
        a.numeroOS === tokenOuNumero ||
        tokenOuNumero.includes(a.tokenOS) ||
        a.tokenOS.includes(tokenOuNumero)
    ) || null
  );
}

export async function salvarAvaliacaoOS(dados: {
  tokenOS: string;
  numeroOS: string;
  cliente: string;
  equipamento: string;
  estrelas: number;
  elogio?: string;
  tags?: string[];
}): Promise<AvaliacaoOS> {
  const agora = new Date();
  const novaAvaliacao: AvaliacaoOS = {
    ...dados,
    criadaEm: agora.toISOString(),
    dataFmt: agora.toLocaleDateString("pt-BR"),
  };

  // 1. Salva no localStorage em sos_avaliacoes
  try {
    const todas = obterTodasAvaliacoes();
    const filtradas = todas.filter((a) => a.tokenOS !== dados.tokenOS);
    filtradas.unshift(novaAvaliacao);
    localStorage.setItem(AVALIACOES_STORAGE_KEY, JSON.stringify(filtradas));
  } catch (e) {
    console.warn("Erro ao salvar avaliação no localStorage:", e);
  }

  // 2. Atualiza no mapa de publicOS local
  try {
    const publicSalvo = localStorage.getItem("sos_public_os");
    if (publicSalvo) {
      const mapa = JSON.parse(publicSalvo);
      if (mapa[dados.tokenOS]) {
        mapa[dados.tokenOS] = {
          ...mapa[dados.tokenOS],
          avaliacao: novaAvaliacao,
        };
        localStorage.setItem("sos_public_os", JSON.stringify(mapa));
      }
    }
  } catch (e) {
    console.warn("Erro ao atualizar sos_public_os com avaliação:", e);
  }

  // 3. Atualiza no Firebase Realtime Database
  try {
    await set(ref(database, `${AVALIACOES_PATH}/${dados.tokenOS}`), novaAvaliacao);
    await set(ref(database, `publicOS/${dados.tokenOS}/avaliacao`), novaAvaliacao);
  } catch (e) {
    console.warn("Não foi possível salvar avaliação no Firebase:", e);
  }

  // 4. Dispara eventos para atualização em tempo real no Dashboard e outras abas
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sos-avaliacao-nova", { detail: novaAvaliacao }));
    window.dispatchEvent(new Event("sos-firebase-update"));
    window.dispatchEvent(new Event("storage"));
  }

  return novaAvaliacao;
}

export function calcularMetricasSatisfacao(avaliacoes: AvaliacaoOS[]) {
  if (!avaliacoes || avaliacoes.length === 0) {
    return {
      media: 5.0,
      total: 0,
      percentualPositivo: 100,
      estrelas5: 0,
      estrelas4: 0,
      estrelas3: 0,
      estrelas2: 0,
      estrelas1: 0,
    };
  }

  const total = avaliacoes.length;
  const soma = avaliacoes.reduce((acc, curr) => acc + (curr.estrelas || 5), 0);
  const media = parseFloat((soma / total).toFixed(1));

  const estrelas5 = avaliacoes.filter((a) => a.estrelas === 5).length;
  const estrelas4 = avaliacoes.filter((a) => a.estrelas === 4).length;
  const estrelas3 = avaliacoes.filter((a) => a.estrelas === 3).length;
  const estrelas2 = avaliacoes.filter((a) => a.estrelas === 2).length;
  const estrelas1 = avaliacoes.filter((a) => a.estrelas === 1).length;

  const positivas = estrelas5 + estrelas4;
  const percentualPositivo = Math.round((positivas / total) * 100);

  return {
    media,
    total,
    percentualPositivo,
    estrelas5,
    estrelas4,
    estrelas3,
    estrelas2,
    estrelas1,
  };
}
