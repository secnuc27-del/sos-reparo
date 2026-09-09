import { useState } from "react";
import { Star, CheckCircle2, Sparkles, Send, MessageSquareHeart, ThumbsUp } from "lucide-react";
import { salvarAvaliacaoOS, type AvaliacaoOS } from "@/lib/avaliacoes";

interface PesquisaSatisfacaoClienteProps {
  tokenOS: string;
  numeroOS: string;
  cliente: string;
  equipamento: string;
  avaliacaoExistente?: AvaliacaoOS | null;
  aoAvaliar?: (avaliacao: AvaliacaoOS) => void;
}

const TAGS_SUGERIDAS = [
  "⚡ Atendimento Rápido",
  "✨ Serviço Impecável",
  "💰 Preço Justo",
  "👨‍🔧 Técnico Educado",
  "🛡️ Transparência Total",
  "👍 Recomendo a Todos",
];

const FRASES_ESTRELAS: Record<number, { texto: string; cor: string; emoji: string }> = {
  5: { texto: "Incrível! Ficamos muito felizes!", cor: "text-amber-400", emoji: "🤩" },
  4: { texto: "Muito bom! Obrigado pela confiança!", cor: "text-amber-300", emoji: "😊" },
  3: { texto: "Bom! Vamos continuar melhorando.", cor: "text-yellow-400", emoji: "👍" },
  2: { texto: "Sentimos muito, queremos melhorar.", cor: "text-orange-400", emoji: "😐" },
  1: { texto: "Poxa, conte-nos o que podemos corrigir.", cor: "text-rose-400", emoji: "😞" },
};

export function PesquisaSatisfacaoCliente({
  tokenOS,
  numeroOS,
  cliente,
  equipamento,
  avaliacaoExistente,
  aoAvaliar,
}: PesquisaSatisfacaoClienteProps) {
  const [estrelas, setEstrelas] = useState<number>(avaliacaoExistente?.estrelas || 5);
  const [hoverEstrelas, setHoverEstrelas] = useState<number>(0);
  const [elogio, setElogio] = useState<string>(avaliacaoExistente?.elogio || "");
  const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>(avaliacaoExistente?.tags || []);
  const [enviado, setEnviado] = useState<boolean>(Boolean(avaliacaoExistente));
  const [enviando, setEnviando] = useState<boolean>(false);
  const [avaliacaoSalva, setAvaliacaoSalva] = useState<AvaliacaoOS | null>(avaliacaoExistente || null);

  const toggleTag = (tag: string) => {
    setTagsSelecionadas((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleEnviar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (estrelas < 1 || enviando) return;

    setEnviando(true);
    try {
      const nova = await salvarAvaliacaoOS({
        tokenOS,
        numeroOS,
        cliente,
        equipamento,
        estrelas,
        elogio: elogio.trim(),
        tags: tagsSelecionadas,
      });
      setAvaliacaoSalva(nova);
      setEnviado(true);
      if (aoAvaliar) aoAvaliar(nova);
    } catch (err) {
      console.warn("Erro ao registrar avaliação:", err);
    } finally {
      setEnviando(false);
    }
  };

  // Se já foi enviada, exibe o cartão de agradecimento e as estrelas recebidas
  if (enviado && avaliacaoSalva) {
    return (
      <section className="mt-5 overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-400 ring-4 ring-amber-400/10 shadow-lg">
            <Sparkles className="h-7 w-7 animate-pulse" />
          </div>

          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Avaliação Registrada
          </span>

          <h3 className="mt-3 text-xl font-black text-white">
            Muito obrigado, {cliente}!
          </h3>
          <p className="mt-1 text-xs text-slate-300 max-w-md">
            Sua opinião sobre o reparo do seu <strong>{equipamento}</strong> foi enviada diretamente para a equipe da SOS Reparo.
          </p>

          {/* Exibição das estrelas */}
          <div className="mt-4 flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-7 w-7 ${
                  i <= avaliacaoSalva.estrelas
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                    : "fill-slate-800 text-slate-700"
                }`}
              />
            ))}
          </div>

          {avaliacaoSalva.elogio && (
            <div className="mt-4 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                <MessageSquareHeart className="h-3.5 w-3.5" />
                Seu Elogio:
              </p>
              <p className="mt-1.5 text-sm italic text-slate-200">
                "{avaliacaoSalva.elogio}"
              </p>
            </div>
          )}

          {avaliacaoSalva.tags && avaliacaoSalva.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 max-w-md">
              {avaliacaoSalva.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-xl border border-slate-800 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  const estrelaAtiva = hoverEstrelas || estrelas;
  const feedback = FRASES_ESTRELAS[estrelaAtiva] || FRASES_ESTRELAS[5];

  return (
    <section className="mt-5 overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 p-5 sm:p-7 shadow-2xl">
      <form onSubmit={handleEnviar} className="space-y-4">
        {/* Cabeçalho da Pesquisa */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-bold text-amber-300 border border-amber-400/20">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              Pesquisa de Satisfação
            </span>
            <h3 className="mt-2 text-lg sm:text-xl font-black text-white">
              Como foi seu atendimento na SOS Reparo?
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Avalie de 1 a 5 estrelas e ajude outros clientes a conhecerem nosso serviço.
            </p>
          </div>
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <MessageSquareHeart className="h-6 w-6" />
          </div>
        </div>

        {/* Seleção Interativa de 1 a 5 Estrelas */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="flex items-center gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5].map((i) => {
              const selecionada = i <= (hoverEstrelas || estrelas);
              return (
                <button
                  type="button"
                  key={i}
                  onMouseEnter={() => setHoverEstrelas(i)}
                  onMouseLeave={() => setHoverEstrelas(0)}
                  onClick={() => setEstrelas(i)}
                  className="group relative p-1 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                  aria-label={`${i} estrelas`}
                >
                  <Star
                    className={`h-9 w-9 sm:h-12 sm:w-12 transition-all duration-200 ${
                      selecionada
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                        : "fill-slate-800 text-slate-700 group-hover:text-slate-500"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-sm font-bold transition-all">
            <span className="text-base">{feedback.emoji}</span>
            <span className={feedback.cor}>{feedback.texto}</span>
          </div>
        </div>

        {/* Tags Rápidas de Elogio */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-2">
            O que você mais gostou? (Toque para selecionar)
          </label>
          <div className="flex flex-wrap gap-2">
            {TAGS_SUGERIDAS.map((tag) => {
              const ativa = tagsSelecionadas.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                    ativa
                      ? "border-amber-400 bg-amber-400/20 text-amber-200 shadow-sm shadow-amber-500/10 scale-102"
                      : "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Campo de Comentário / Elogio */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">
            Deixe um elogio ou observação (opcional):
          </label>
          <textarea
            value={elogio}
            onChange={(e) => setElogio(e.target.value)}
            placeholder="Ex: O conserto ficou perfeito, me entregaram super rápido e o técnico foi super atencioso!"
            rows={3}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
          />
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={enviando}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {enviando ? (
            <span>Enviando avaliação...</span>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Enviar Avaliação ({estrelas} {estrelas === 1 ? "Estrela" : "Estrelas"})</span>
            </>
          )}
        </button>
      </form>
    </section>
  );
}
