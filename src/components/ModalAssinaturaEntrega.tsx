import { createPortal } from "react-dom";
import { useState } from "react";
import { X, CheckCircle2, ShieldCheck, PenLine, Loader2, AlertCircle } from "lucide-react";
import { SignatureCanvas } from "./SignatureCanvas";
import { confirmarEntregaComAssinatura } from "@/lib/entrega";

type ModalAssinaturaEntregaProps = {
  aberto: boolean;
  aoFechar: () => void;
  os: any;
  aoSucesso?: () => void;
};

export function ModalAssinaturaEntrega({
  aberto,
  aoFechar,
  os,
  aoSucesso,
}: ModalAssinaturaEntregaProps) {
  const [assinatura, setAssinatura] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  if (!aberto || !os || typeof document === "undefined") return null;

  const handleConfirmar = async () => {
    if (!assinatura) {
      setErro("Por favor, colete a assinatura do cliente no campo abaixo para confirmar a entrega.");
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      const tokenPublico = os.publicToken || os.token;
      await confirmarEntregaComAssinatura(os.numero, assinatura, tokenPublico);
      setAssinatura("");
      aoSucesso?.();
      aoFechar();
    } catch (e) {
      console.error("Falha ao registrar entrega:", e);
      setErro("Ocorreu um erro ao salvar a assinatura. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="border-b border-border bg-muted/40 p-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
              <PenLine className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                Termo de Entrega & Assinatura
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Validação de entrega com assinatura digital do cliente
              </p>
            </div>
          </div>
          <button
            onClick={aoFechar}
            disabled={salvando}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-muted">
          {/* Card Resumo da OS */}
          <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Ordem de Serviço</p>
                <p className="text-base font-black text-cyan-500">{os.numero}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-muted-foreground">Cliente</p>
                <p className="text-sm font-bold text-foreground">{os.cliente}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Aparelho:</span>
                <strong className="text-foreground font-semibold">{os.equipamento}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Serviço:</span>
                <strong className="text-foreground font-semibold">{os.servico}</strong>
              </div>
            </div>
          </div>

          {/* Cláusula de Entrega */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-muted-foreground leading-relaxed flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
            <p>
              Declaro que recebi o equipamento acima consertado, testado e em perfeito estado de
              funcionamento, ciente do prazo de <strong>90 dias de garantia legal</strong> referente
              aos serviços realizados (Art. 26 do CDC).
            </p>
          </div>

          {/* Campo de Assinatura */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <PenLine className="h-3.5 w-3.5 text-primary" />
                Assinatura do Cliente
              </label>
              <span className="text-[11px] text-muted-foreground">
                (Assine com o dedo ou mouse)
              </span>
            </div>

            <SignatureCanvas
              value={assinatura}
              onChange={(valor) => {
                setAssinatura(valor);
                setErro("");
              }}
            />

            {erro && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {erro}
              </p>
            )}
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="border-t border-border bg-muted/40 p-4 sm:p-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={aoFechar}
            disabled={salvando}
            className="rounded-xl border border-input bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={salvando}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {salvando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Registrando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirmar Entrega</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
