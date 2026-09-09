import { createPortal } from "react-dom";
import { X, CheckCircle2, ShieldCheck, Printer, Calendar, Clock, User, Laptop } from "lucide-react";

type ModalVisualizarAssinaturaProps = {
  aberto: boolean;
  aoFechar: () => void;
  os: any;
};

export function ModalVisualizarAssinatura({
  aberto,
  aoFechar,
  os,
}: ModalVisualizarAssinaturaProps) {
  if (!aberto || !os || typeof document === "undefined") return null;

  const dataHoraFormatada = os.assinaturaEm
    ? new Date(os.assinaturaEm).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : `${os.dataRetirada || os.previsao || ""} ${os.horaRetirada || ""}`.trim() || "Data não informada";

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="border-b border-border bg-muted/40 p-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Comprovante de Entrega</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assinatura digital registrada no sistema
              </p>
            </div>
          </div>
          <button
            onClick={aoFechar}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Dados do Aparelho */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="font-bold text-sm text-cyan-500">{os.numero}</span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-bold text-emerald-500 border border-emerald-500/20">
                Aparelho Entregue
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 text-primary shrink-0" />
              <span>Cliente: <strong className="text-foreground">{os.cliente}</strong></span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Laptop className="h-4 w-4 text-primary shrink-0" />
              <span>Equipamento: <strong className="text-foreground">{os.equipamento}</strong></span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>Data/Hora da Entrega: <strong className="text-foreground">{dataHoraFormatada}</strong></span>
            </div>
          </div>

          {/* Imagem da Assinatura */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Assinatura Coletada na Retirada:
            </label>
            <div className="rounded-2xl border border-dashed border-border bg-white p-4 flex flex-col items-center justify-center min-h-[140px] shadow-inner">
              {os.assinaturaEntrega ? (
                <img
                  src={os.assinaturaEntrega}
                  alt={`Assinatura de ${os.cliente}`}
                  className="max-h-28 w-auto object-contain"
                />
              ) : (
                <p className="text-xs text-slate-400 italic">Nenhuma assinatura desenhada</p>
              )}
            </div>
          </div>

          {/* Selo de Garantia */}
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>Assinatura digital armazenada com segurança jurídica vinculada à OS.</span>
          </div>
        </div>

        {/* Rodapé */}
        <div className="border-t border-border bg-muted/40 p-4 sm:p-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir</span>
          </button>
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
