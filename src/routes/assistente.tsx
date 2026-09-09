import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Bot,
  Send,
  User,
  Settings,
  Key,
  CheckCircle2,
  Sparkles,
  Loader2,
  Trash2,
  HelpCircle,
  Cpu,
  Smartphone,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { clientes, equipamentos, ordensDeServico } from "../lib/dados";

type Mensagem = {
  role: "user" | "model";
  text: string;
};

const PROMPTS_RAPIDOS = [
  {
    label: "Notebook sem vídeo",
    icon: Cpu,
    texto: "Notebook Dell liga, cooler gira mas a tela permanece preta. Quais os testes recomendados?",
  },
  {
    label: "iPhone não carrega",
    icon: Smartphone,
    texto: "iPhone 11 não carrega e não é reconhecido no PC. O que testar antes de trocar a bateria?",
  },
  {
    label: "Resumo da Oficina",
    icon: Wrench,
    texto: "Faça um resumo dos equipamentos que estão em reparo na oficina agora.",
  },
  {
    label: "Sugestão de Preço",
    icon: Sparkles,
    texto: "Qual a faixa de preço recomendada de mão de obra para troca de tela de smartphone?",
  },
];

export function AssistentePage() {
  const [apiKey, setApiKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [messages, setMessages] = useState<Mensagem[]>([
    {
      role: "model",
      text: "Olá! Sou o **SOS Copilot**, seu assistente de diagnóstico técnico e gestão da oficina. Posso te ajudar a identificar defeitos em bancada, sugerir testes com multímetro, estimar orçamentos e resumir os aparelhos da loja. Como posso ajudar hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("sos_gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setInputKey(savedKey);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const salvarApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const chaveLimpa = inputKey.trim();
    setApiKey(chaveLimpa);
    if (chaveLimpa) {
      localStorage.setItem("sos_gemini_api_key", chaveLimpa);
    } else {
      localStorage.removeItem("sos_gemini_api_key");
    }
    setModalConfigAberto(false);
  };

  const gerarRespostaLocal = (pergunta: string): string => {
    const p = pergunta.toLowerCase();

    if (p.includes("oficina") || p.includes("resumo") || p.includes("ordens") || p.includes("aparelhos")) {
      const emReparo = equipamentos.filter((e) => e.status.toLowerCase().includes("reparo"));
      const aguardando = equipamentos.filter((e) => e.status.toLowerCase().includes("aguardando") || e.status.toLowerCase().includes("fila"));
      return `📋 **Resumo da Oficina SOS Reparo:**\n\n- **Aparelhos em Reparo Ativo (${emReparo.length}):**\n${emReparo.map((e) => `  • **${e.marca} ${e.modelo}** (${e.cliente}) - Defeito: *${e.defeito}*`).join("\n")}\n\n- **Aguardando Peça / Fila (${aguardando.length}):**\n${aguardando.map((e) => `  • **${e.marca} ${e.modelo}** (${e.cliente}) - Defeito: *${e.defeito}*`).join("\n")}\n\n💡 *Dica:* Você pode acessar a aba **Ordens de Serviço** para gerenciar o fluxo completo.`;
    }

    if (p.includes("notebook") || p.includes("sem vídeo") || p.includes("tela preta") || p.includes("cooler")) {
      return `🔍 **Diagnóstico Técnico: Notebook sem Vídeo / Tela Escura**\n\n**1. Prováveis Causas:**\n- Oxidação ou falha de contato nos módulos de memória RAM (60% dos casos).\n- Corrupção de arquivo BIOS / EC.\n- Ausência de tensão secundária (+3.3V_ALW ou +5V_ALW).\n\n**2. Roteiro de Testes Recomendado:**\n1. **Inspeção de Memória:** Remova os pentes de RAM, limpe os contatos dourados com borracha isopropílica e teste em slots alternados.\n2. **Consumo na Fonte Assimétrica:** Conecte o notebook na fonte regulável e verifique a corrente:\n   - Se travar em ~0.15A a 0.25A: circuito de carga/alimentação secundária ausente.\n   - Se oscilar entre 0.40A e 0.80A: processamento ativo, provável falha na tela LVDS/eDP ou cabo flat.\n3. **Vídeo Externo:** Conecte um cabo HDMI para descartar falha no display interno.\n\n💰 **Faixa de Orçamento Sugerida:** R$ 150,00 a R$ 280,00 (mão de obra básica de desoxidação/reparo).`;
    }

    if (p.includes("iphone") || p.includes("carrega") || p.includes("carga") || p.includes("bateria")) {
      return `🔋 **Diagnóstico Técnico: Smartphone não carrega**\n\n**1. Procedimento de Teste:**\n- **Inspeção Óptica do Conector:** Use o microscópio ou lupa para verificar acúmulo de fiapos ou pinos amassados no conector Lightning/Tipo-C.\n- **Medição com USB Tester (Doutor USB):**\n  - **0.00A (Sem consumo):** Linha VBUS interrompida, Tristar/Hydra (CI de carga) danificado ou conector rompido.\n  - **0.40A a 0.60A (Carga lenta/Falsa):** Falha de comunicação nas linhas D+ e D- ou bateria em descarga profunda.\n  - **0.90A a 1.50A+:** Circuito de carga operando normalmente.\n\n💰 **Faixa de Orçamento:** R$ 120,00 a R$ 220,00 para troca de conector de carga.`;
    }

    if (p.includes("preço") || p.includes("valor") || p.includes("quanto cobrar") || p.includes("orçamento")) {
      return `💵 **Tabela Média de Mão de Obra Técnica Sugerida:**\n\n- **Troca de Tela Smartphone:** R$ 100,00 a R$ 180,00 (+ custo da peça)\n- **Troca de Bateria:** R$ 80,00 a R$ 140,00 (+ custo da peça)\n- **Limpeza & Troca de Pasta Térmica (PC/Notebook/Console):** R$ 120,00 a R$ 200,00\n- **Reparo em Placa-Mãe (Curto / Reballing / CI de Carga):** R$ 250,00 a R$ 550,00\n- **Formatação com Backup:** R$ 90,00 a R$ 150,00\n\n*Nota:* Sempre informe a garantia legal de 90 dias conforme o Art. 26 do CDC.`;
    }

    return `Entendido! Analisando sua solicitação sobre **"${pergunta}"**:\n\n1. **Análise de Bancada:** Recomendo verificar primeiro as tensões de entrada (VCC/VBUS) e garantir que a fonte de alimentação está fornecendo amperagem estável.\n2. **Inspeção Visual:** Faça uma verificação visual detalhada sob o microscópio em busca de capacitores cerâmicos rachados, oxidações ou marcas de aquecimento.\n3. **Registro:** Não se esqueça de documentar o laudo na Ordem de Serviço para manter o cliente atualizado pelo QR Code.\n\n*Para respostas geradas com IA em tempo real com Gemini, configure sua chave de API no botão de configurações acima!*`;
  };

  const handleEnviar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textoPergunta = input.trim();
    if (!textoPergunta || isLoading) return;

    const novasMensagens: Mensagem[] = [...messages, { role: "user", text: textoPergunta }];
    setMessages(novasMensagens);
    setInput("");
    setIsLoading(true);

    try {
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const promptDoSistema = `Você é o SOS Copilot, um especialista sênior em eletrônica e assistência técnica de computadores, notebooks, smartphones (Android e iPhone) e consoles de videogame.
Seja técnico, objetivo e prático. Use formatação markdown, listas com marcadores e destaque os valores sugeridos e procedimentos com multímetro/fonte assimétrica.
Dados atuais da assistência: ${clientes.length} clientes cadastrados, ${equipamentos.length} equipamentos e ${ordensDeServico.length} ordens de serviço ativas.`;

        const chat = model.startChat({
          history: [
            { role: "user", parts: [{ text: promptDoSistema }] },
            { role: "model", parts: [{ text: "Entendido. Sou o SOS Copilot e responderei como especialista de bancada da SOS Reparo." }] },
            ...novasMensagens.slice(-6).map((m) => ({
              role: m.role,
              parts: [{ text: m.text }],
            })),
          ],
        });

        const result = await chat.sendMessage(textoPergunta);
        const resposta = result.response.text();
        setMessages([...novasMensagens, { role: "model", text: resposta }]);
      } else {
        // Modo inteligente offline / fallback imediato
        await new Promise((r) => setTimeout(r, 600));
        const respostaLocal = gerarRespostaLocal(textoPergunta);
        setMessages([...novasMensagens, { role: "model", text: respostaLocal }]);
      }
    } catch (error: any) {
      console.warn("Erro na chamada da IA:", error);
      // Fallback gracioso se a API key falhar
      const respostaFallback = gerarRespostaLocal(textoPergunta);
      setMessages([
        ...novasMensagens,
        {
          role: "model",
          text: `⚠️ *(Modo Local Ativado)*: ${respostaFallback}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-130px)] max-h-[850px] rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="border-b border-border bg-muted/40 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/20">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">SOS Copilot • Assistente IA</h2>
                <span className="flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-500 border border-cyan-500/20">
                  <Sparkles className="h-2.5 w-2.5" />
                  {apiKey ? "Gemini Conectado" : "Modo Bancada"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Diagnóstico de placas, roteiros de teste, estimativa de orçamento e consulta da loja
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([messages[0]])}
              className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Limpar conversa"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setModalConfigAberto(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Configurar Chave de API Gemini"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Chave API</span>
            </button>
          </div>
        </div>

        {/* Sugestões Rápidas de Pergunta */}
        <div className="flex border-b border-border bg-muted/20 px-4 py-2 gap-2 overflow-x-auto scrollbar-none">
          {PROMPTS_RAPIDOS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(p.texto);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-cyan-500/50 hover:bg-muted transition-all whitespace-nowrap shadow-xs"
            >
              <p.icon className="h-3.5 w-3.5 text-cyan-500" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Lista de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-muted">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/20">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                      : "bg-muted/70 text-foreground border border-border/70 rounded-tl-none leading-relaxed"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/20">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-border/70 bg-muted/60 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                <span>Analisando diagnóstico e gerando laudo técnico...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleEnviar}
          className="border-t border-border bg-card p-3 sm:p-4 flex gap-2 items-end"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Descreva o sintoma do aparelho (ex: 'Notebook não liga e acende led laranja')..."
            className="flex-1 max-h-32 min-h-[44px] rounded-xl border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleEnviar();
              }
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 shadow-sm"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </div>

      {/* Modal de Configuração de API Key */}
      {modalConfigAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Key className="h-5 w-5 text-cyan-500" />
                <h3 className="font-bold text-foreground text-base">Chave de API do Google Gemini</h3>
              </div>
              <button
                onClick={() => setModalConfigAberto(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              O assistente já funciona no <strong>Modo Bancada</strong> sem precisar de chave. Se quiser respostas personalizadas com a IA do Google Gemini em tempo real, insira sua chave gratuita da Google AI Studio:
            </p>

            <form onSubmit={salvarApiKey} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-[11px] text-muted-foreground block mt-1">
                  A chave fica salva com segurança apenas no seu navegador.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalConfigAberto(false)}
                  className="rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90"
                >
                  Salvar Chave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
