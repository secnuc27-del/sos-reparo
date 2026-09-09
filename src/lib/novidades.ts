import { useEffect, useState } from "react";

export type NovaFuncao = {
  titulo: string;
  descricao: string;
  comoUsar?: string;
};

export type Atualizacao = {
  versao: string;
  data: string;
  titulo: string;
  descricao: string;
  novasFuncoes: NovaFuncao[];
  melhorias?: string[];
  destaque?: boolean;
};

// =========================================================================
// 📢 CENTRAL DE VERSÕES E NOVIDADES DO SOS REPARO
// 
// 💡 COMO ADICIONAR UMA NOVA ATUALIZAÇÃO:
// 1. Basta colocar um novo objeto no topo do array HISTORICO_ATUALIZACOES abaixo.
// 2. A 'VERSAO_ATUAL' será atualizada automaticamente em todo o sistema.
// 3. O número da versão lá embaixo mudará automaticamente.
// 4. O sininho de notificação acenderá a bolinha azul para todos os usuários
//    explicando as novidades, novas funções e como usar!
// =========================================================================

export const HISTORICO_ATUALIZACOES: Atualizacao[] = [
  {
    versao: "v1.5.0",
    data: "08/09/2026",
    titulo: "Assinatura Digital do Cliente & Termo de Entrega em Tempo Real",
    descricao: "Novo sistema de coleta de assinatura digital touch/mouse na entrega do aparelho, com validade jurídica e comprovante para impressão.",
    novasFuncoes: [
      {
        titulo: "Assinatura Digital na Retirada (Touch & Mouse)",
        descricao: "Ao finalizar o conserto, o cliente assina com o dedo na tela do celular ou mouse no PC atestando o recebimento do equipamento em perfeito estado.",
        comoUsar: "No card da OS com status 'Pronto', clique no botão verde 'Entregar'. Colete a assinatura do cliente e confirme a entrega."
      },
      {
        titulo: "Comprovante Assinado com Validação e Impressão",
        descricao: "Todas as OS entregues armazenam a imagem oficial da assinatura com data e hora exatas da entrega.",
        comoUsar: "Clique no botão 'Assinatura' em qualquer OS entregue para visualizar o termo assinado e imprimir se desejar."
      },
      {
        titulo: "Assinatura Remota pelo Celular (QR Code)",
        descricao: "O cliente pode assinar o termo de retirada direto do próprio celular na tela de acompanhamento.",
        comoUsar: "O cliente escaneia o QR Code, acessa a página da OS e clica em 'Assinar Termo de Retirada na Tela'."
      }
    ],
    melhorias: [
      "Cláusula de 90 dias de garantia legal automática (Art. 26 do CDC).",
      "Sincronização em tempo real da entrega e assinatura entre PC e celular via Firebase.",
      "Transição automática da OS para a seção de 'Entregues ao Cliente' e histórico."
    ],
    destaque: true
  },
  {
    versao: "v1.4.2",
    data: "08/09/2026",
    titulo: "Central de Notificações de Atualizações & Badges no Chat",
    descricao: "Nova central integrada ao sininho com explicação de cada atualização, novas funções e como usar, além de badges com contador de mensagens.",
    novasFuncoes: [
      {
        titulo: "Sininho de Atualizações do Sistema",
        descricao: "Agora você fica sempre por dentro de tudo o que foi modificado e adicionado no SOS Reparo.",
        comoUsar: "Clique no ícone de sino no canto superior direito para ver os detalhes da versão, novidades e passo a passo de como usar."
      },
      {
        titulo: "Contador de Mensagens Não Lidas (1, 2, 3...)",
        descricao: "O botão de chat de cada Ordem de Serviço agora exibe um selo numérico vermelho quando chegam mensagens do cliente.",
        comoUsar: "Basta clicar no botão de chat da OS. A conversa será aberta, marcada como lida e o selo desaparecerá automaticamente."
      },
      {
        titulo: "Identificador de Versão no Rodapé",
        descricao: "Exibe a versão oficial do sistema no rodapé da barra lateral e da página, mudando automaticamente a cada atualização.",
        comoUsar: "Clique na versão no rodapé a qualquer momento para reabrir a lista completa de novidades."
      }
    ],
    melhorias: [
      "Alerta sonoro discreto quando uma nova mensagem do cliente chega com o sistema aberto.",
      "Sincronização em tempo real das mensagens e do status de lido entre múltiplos dispositivos.",
      "Indicador visual com ponto azul no sino quando há uma versão nova ainda não visualizada."
    ],
    destaque: true
  },
  {
    versao: "v1.4.1",
    data: "05/09/2026",
    titulo: "Chat ao Vivo entre Técnico e Cliente",
    descricao: "Comunicação direta em tempo real vinculada à Ordem de Serviço, com envio instantâneo e histórico salvo.",
    novasFuncoes: [
      {
        titulo: "Chat Integrado na OS",
        descricao: "Canal direto para tirar dúvidas, enviar avisos e negociar com o cliente sem sair do sistema.",
        comoUsar: "Na página de Ordens de Serviço, clique no ícone azul de chat no card da OS desejada."
      }
    ],
    melhorias: [
      "Preservação do histórico de mensagens no Firebase e no navegador.",
      "Atualização automática sem necessidade de recarregar a página."
    ]
  },
  {
    versao: "v1.4.0",
    data: "01/09/2026",
    titulo: "Acompanhamento por QR Code & Aprovação de Orçamento",
    descricao: "Página pública de acompanhamento da OS para o cliente com fotos do reparo e aprovação digital de orçamento.",
    novasFuncoes: [
      {
        titulo: "QR Code de Acompanhamento para Celular",
        descricao: "Gera um QR Code único para a OS que o cliente escaneia com a câmera do celular para ver o andamento em tempo real.",
        comoUsar: "No card da OS, clique no ícone de QR Code para exibir, copiar o link direto ou imprimir para colar no equipamento."
      },
      {
        titulo: "Aprovação ou Recusa de Orçamento pelo Cliente",
        descricao: "O cliente pode aprovar ou recusar o orçamento com um toque pelo celular.",
        comoUsar: "O cliente acessa o link do QR Code e clica em 'Aprovar orçamento' ou 'Recusar'."
      }
    ],
    melhorias: [
      "Área para fotos do aparelho 'Antes' e 'Depois' do reparo.",
      "Integração de aviso de conclusão direto no WhatsApp do cliente."
    ]
  }
];

// A versão atual é sempre a primeira do histórico
export const VERSAO_ATUAL = HISTORICO_ATUALIZACOES[0]?.versao || "v1.0.0";

const STORAGE_KEY_VERSAO_VISTA = "sos_ultima_versao_vista";

export function obterUltimaVersaoVista(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_VERSAO_VISTA) || "";
  } catch {
    return "";
  }
}

export function marcarVersaoComoVista(versao: string = VERSAO_ATUAL) {
  try {
    localStorage.setItem(STORAGE_KEY_VERSAO_VISTA, versao);
    window.dispatchEvent(new CustomEvent("sos-novidades-update"));
  } catch {}
}

export function temNovidadeNaoLida(): boolean {
  try {
    const vista = localStorage.getItem(STORAGE_KEY_VERSAO_VISTA);
    return vista !== VERSAO_ATUAL;
  } catch {
    return false;
  }
}

export function useNovidades() {
  const [temNovidade, setTemNovidade] = useState(() => temNovidadeNaoLida());
  const [ultimaAtualizacao] = useState(() => HISTORICO_ATUALIZACOES[0]);

  useEffect(() => {
    const atualizar = () => setTemNovidade(temNovidadeNaoLida());
    window.addEventListener("sos-novidades-update", atualizar);
    window.addEventListener("storage", atualizar);
    window.addEventListener("focus", atualizar);

    return () => {
      window.removeEventListener("sos-novidades-update", atualizar);
      window.removeEventListener("storage", atualizar);
      window.removeEventListener("focus", atualizar);
    };
  }, []);

  const marcarComoLida = () => {
    marcarVersaoComoVista(VERSAO_ATUAL);
    setTemNovidade(false);
  };

  return {
    versaoAtual: VERSAO_ATUAL,
    temNovidade,
    marcarComoLida,
    historico: HISTORICO_ATUALIZACOES,
    ultimaAtualizacao,
  };
}
