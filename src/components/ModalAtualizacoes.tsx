import { createPortal } from "react-dom";
import { Sparkles, X, CheckCircle2, Lightbulb, History, ArrowUpRight } from "lucide-react";
import { useNovidades, type Atualizacao } from "@/lib/novidades";
import { useState } from "react";

type ModalAtualizacoesProps = {
  aberta: boolean;
  aoFechar: () => void;
};

export function ModalAtualizacoes({ aberta, aoFechar }: ModalAtualizacoesProps) {
  const { versaoAtual, historico, marcarComoLida } = useNovidades();
  const [versaoSelecionada, setVersaoSelecionada] = useState<string>(versaoAtual);

  if (!aberta || typeof document === "undefined") return null;

  const fecharEMarcar = () => {
    marcarComoLida();
    aoFechar();
  };

  const atualizacaoExibida: Atualizacao =
    historico.find((a) => a.versao === versaoSelecionada) || historico[0];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="border-b border-border bg-muted/40 p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">Novidades & Atualizações</h3>
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-extrabold text-cyan-500 border border-cyan-500/20">
                  {versaoAtual}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Saiba o que mudou, novas funções e aprenda a usar as ferramentas.
              </p>
            </div>
          </div>
          <button
            onClick={fecharEMarcar}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Abas / Seletor de Versões */}
        <div className="flex border-b border-border bg-muted/20 px-4 sm:px-6 py-2 gap-2 overflow-x-auto scrollbar-none">
          {historico.map((item, idx) => {
            const isAtiva = item.versao === versaoSelecionada;
            return (
              <button
                key={item.versao}
                onClick={() => setVersaoSelecionada(item.versao)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  isAtiva
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {idx === 0 && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                <span>{item.versao}</span>
                {idx === 0 && <span className="text-[10px] opacity-80">(Mais recente)</span>}
              </button>
            );
          })}
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-muted">
          {/* Card Principal da Versão Selecionada */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5 dark:bg-cyan-950/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">
                {atualizacaoExibida.versao === versaoAtual ? "🎉 Versão Atual" : "Registro Histórico"}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Lançado em {atualizacaoExibida.data}
              </span>
            </div>
            <h4 className="mt-2 text-lg font-black text-foreground">
              {atualizacaoExibida.titulo}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {atualizacaoExibida.descricao}
            </p>
          </div>

          {/* Novas Funções e Como Usar */}
          {atualizacaoExibida.novasFuncoes.length > 0 && (
            <div className="space-y-4">
              <h5 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                Novas Funções
              </h5>

              <div className="space-y-3">
                {atualizacaoExibida.novasFuncoes.map((funcao, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-2 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h6 className="font-bold text-sm text-foreground">{funcao.titulo}</h6>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {funcao.descricao}
                        </p>
                      </div>
                    </div>

                    {funcao.comoUsar && (
                      <div className="mt-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                        <Lightbulb className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                        <div>
                          <strong className="font-bold text-blue-600 dark:text-blue-300 block mb-0.5">
                            Como usar:
                          </strong>
                          <span>{funcao.comoUsar}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Melhorias & Ajustes */}
          {atualizacaoExibida.melhorias && atualizacaoExibida.melhorias.length > 0 && (
            <div className="space-y-3">
              <h5 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                Melhorias & Otimizações
              </h5>
              <div className="rounded-2xl border border-border bg-card p-4">
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {atualizacaoExibida.melhorias.map((melhoria, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{melhoria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="border-t border-border bg-muted/40 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <History className="h-4 w-4 text-muted-foreground/80" />
            <span>Sistema atualizado para a versão <strong>{versaoAtual}</strong></span>
          </div>
          <button
            onClick={fecharEMarcar}
            className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Entendido! Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
