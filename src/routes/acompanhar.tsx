import { CheckCircle2, Clock3, Image as ImageIcon, LoaderCircle, ShieldCheck, ThumbsDown, ThumbsUp, Wrench, XCircle, PenLine } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "@tanstack/react-router";
import { atualizarAprovacaoOS, buscarOSPublica, type PublicOSRecord } from "@/lib/osPublica";
import { ChatOS } from "@/components/ChatOS";
import { ModalAssinaturaEntrega } from "@/components/ModalAssinaturaEntrega";
import { ModalVisualizarAssinatura } from "@/components/ModalVisualizarAssinatura";
import { PesquisaSatisfacaoCliente } from "@/components/PesquisaSatisfacaoCliente";
import { obterAvaliacaoPorToken } from "@/lib/avaliacoes";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

const etapas = ["Aguardando", "Em análise", "Em reparo", "Aguardando peça", "Pronto", "Entregue"];

function indiceStatus(status: string) {
  const normalizado = status.toLowerCase();
  if (normalizado.includes("entregue")) return 5;
  if (normalizado.includes("pronto") || normalizado.includes("conclu")) return 4;
  if (normalizado.includes("reparo") || normalizado.includes("manuten")) return 2;
  if (normalizado.includes("peça") || normalizado.includes("peca")) return 3;
  if (normalizado.includes("análise") || normalizado.includes("analise")) return 1;
  return 0;
}

function valorFormatado(valor: string) {
  const texto = String(valor || "A orçar");
  if (texto.toLowerCase().includes("orçar") || texto.toLowerCase().includes("orc")) return texto;
  const numero = Number(texto.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(numero)
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(numero)
    : texto;
}

export function AcompanharPage() {
  const { token } = useParams({ from: "/acompanhar/$token" });
  const [os, setOs] = useState<PublicOSRecord | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [modalAssinatura, setModalAssinatura] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState(false);

  const carregar = useCallback(async (silencioso = false) => {
    if (!silencioso) {
      setCarregando(true);
    }
    const registro = await buscarOSPublica(token);
    if (registro) {
      setOs((prev) => {
        if (!prev) return registro;
        const mudou =
          prev.status !== registro.status ||
          prev.aprovacaoOrcamento !== registro.aprovacaoOrcamento ||
          prev.valor !== registro.valor ||
          prev.fotoAntes !== registro.fotoAntes ||
          prev.fotoDepois !== registro.fotoDepois ||
          prev.assinaturaEntrega !== registro.assinaturaEntrega ||
          JSON.stringify((prev as any).avaliacao) !== JSON.stringify((registro as any).avaliacao);
        return mudou ? { ...prev, ...registro } : prev;
      });
    }
    setCarregando(false);
  }, [token]);

  useEffect(() => {
    // 1. Carga inicial
    void carregar(false);

    // 2. Conexão direta em tempo real com o Firebase (sem recarregar tela nem zerar campos)
    let unsubscribe = () => {};
    try {
      const osRef = ref(database, `publicOS/${token}`);
      unsubscribe = onValue(
        osRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const dados = snapshot.val() as PublicOSRecord;
            setOs((prev) => {
              if (!prev) return dados;
              const mudou =
                prev.status !== dados.status ||
                prev.aprovacaoOrcamento !== dados.aprovacaoOrcamento ||
                prev.valor !== dados.valor ||
                prev.fotoAntes !== dados.fotoAntes ||
                prev.fotoDepois !== dados.fotoDepois ||
                prev.assinaturaEntrega !== dados.assinaturaEntrega ||
                JSON.stringify((prev as any).avaliacao) !== JSON.stringify((dados as any).avaliacao);
              return mudou ? { ...prev, ...dados } : prev;
            });
            setCarregando(false);
          }
        },
        (err) => {
          console.warn("Erro ao sincronizar OS em tempo real:", err);
        }
      );
    } catch (e) {
      console.warn("Firebase listener não inicializado:", e);
    }

    // 3. Atualizações locais quando o mesmo navegador alterar a OS em outra aba
    const handleAtualizacaoLocal = () => {
      void carregar(true);
    };

    window.addEventListener("storage", handleAtualizacaoLocal);
    window.addEventListener("sos-firebase-update", handleAtualizacaoLocal);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleAtualizacaoLocal);
      window.removeEventListener("sos-firebase-update", handleAtualizacaoLocal);
    };
  }, [token, carregar]);

  const responderOrcamento = async (resposta: "aprovado" | "recusado") => {
    if (!os || enviando || os.aprovacaoOrcamento !== "pendente") return;
    setEnviando(true);
    setErro("");
    try {
      await atualizarAprovacaoOS(token, resposta);
      setOs({ ...os, aprovacaoOrcamento: resposta });
    } catch {
      setErro("Não foi possível registrar sua resposta. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100"><LoaderCircle className="h-8 w-8 animate-spin text-cyan-400" /></div>;
  }

  if (!os) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
        <div className="max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-rose-400" />
          <h1 className="text-2xl font-bold">OS não encontrada</h1>
          <p className="mt-2 text-sm text-slate-400">Confira se o QR Code ainda é válido ou peça um novo código à assistência.</p>
        </div>
      </div>
    );
  }

  const etapaAtual = indiceStatus(os.status);
  const aprovacao = os.aprovacaoOrcamento || "pendente";

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6">
      <main className="mx-auto max-w-3xl space-y-5">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">SOS Reparo</p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">Acompanhamento da sua OS</h1>
          </div>
          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-3 text-cyan-300">
            <ShieldCheck className="h-7 w-7" />
          </div>
        </header>

        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <p className="text-sm text-slate-400">Ordem de Serviço</p>
              <p className="mt-1 text-2xl font-black text-cyan-300">{os.numero}</p>
              <p className="mt-2 text-sm text-slate-300">Olá, {os.cliente}!</p>
            </div>
            <div className="rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-bold text-emerald-300">{os.status}</div>
          </div>

          <div className="grid gap-4 py-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-800/70 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">Aparelho</p><p className="mt-1 font-bold">{os.equipamento}</p><p className="text-xs text-slate-400">{os.tipo}</p></div>
            <div className="rounded-2xl bg-slate-800/70 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">Serviço</p><p className="mt-1 font-bold">{os.servico}</p><p className="text-xs text-slate-400">Técnico: {os.tecnico}</p></div>
            <div className="rounded-2xl bg-slate-800/70 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">Entrada</p><p className="mt-1 font-bold">{os.dataEntrada || "Não informada"}</p></div>
            <div className="rounded-2xl bg-slate-800/70 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">Previsão</p><p className="mt-1 font-bold">{os.previsao || "A combinar"}</p></div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
            <div className="mb-5 flex items-center gap-2"><Clock3 className="h-5 w-5 text-cyan-400" /><h2 className="font-bold">Andamento do reparo</h2></div>
            <div className="grid gap-3 sm:grid-cols-6">
              {etapas.map((etapa, index) => (
                <div key={etapa} className="flex items-center gap-3 sm:block sm:text-center">
                  <div className={`mx-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:mx-auto ${index <= etapaAtual ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-500"}`}>
                    {index <= etapaAtual ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs font-bold">{index + 1}</span>}
                  </div>
                  <p className={`text-xs sm:mt-2 ${index <= etapaAtual ? "font-bold text-cyan-300" : "text-slate-500"}`}>{etapa}</p>
                </div>
              ))}
            </div>
          </div>

          <section className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-wider text-amber-300">Orçamento</p><p className="mt-1 text-2xl font-black text-white">{valorFormatado(os.valor)}</p></div>
              {aprovacao === "pendente" ? <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300">Aguardando resposta</span> : <span className={`rounded-full px-3 py-1 text-xs font-bold ${aprovacao === "aprovado" ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"}`}>{aprovacao === "aprovado" ? "Aprovado" : "Recusado"}</span>}
            </div>
            {aprovacao === "pendente" && !os.valor.toLowerCase().includes("orçar") && !os.valor.toLowerCase().includes("orc") && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button disabled={enviando} onClick={() => void responderOrcamento("aprovado")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-400 disabled:opacity-50"><ThumbsUp className="h-4 w-4" /> Aprovar orçamento</button>
                <button disabled={enviando} onClick={() => void responderOrcamento("recusado")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-400/40 px-4 py-3 text-sm font-bold text-rose-300 hover:bg-rose-400/10 disabled:opacity-50"><ThumbsDown className="h-4 w-4" /> Recusar</button>
              </div>
            )}
            {erro && <p className="mt-3 text-sm text-rose-300">{erro}</p>}
          </section>

          {/* Se estiver Pronto e ainda não entregue */}
          {os.status === "Pronto" && !os.assinaturaEntrega && (
            <section className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <PenLine className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Aparelho Pronto para Retirada!</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Seu conserto foi concluído com sucesso. Ao retirar no balcão, você pode assinar o termo digital na tela.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAssinatura(true)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-400 transition-colors shadow-lg"
              >
                <PenLine className="h-4 w-4" />
                <span>Assinar Termo de Retirada na Tela</span>
              </button>
            </section>
          )}

          {/* Se já foi Entregue */}
          {os.status === "Entregue" && (
            <>
              <section className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Equipamento Entregue</h3>
                    <p className="text-xs text-slate-300">
                      Retirada confirmada com garantia ativa de 90 dias.
                    </p>
                  </div>
                </div>
                {os.assinaturaEntrega && (
                  <button
                    onClick={() => setModalVisualizar(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    <span>Ver Comprovante Assinado</span>
                  </button>
                )}
              </section>

              {/* ⭐ Pesquisa de Satisfação NPS (1 a 5 Estrelas) */}
              <PesquisaSatisfacaoCliente
                tokenOS={os.token}
                numeroOS={os.numero}
                cliente={os.cliente}
                equipamento={os.equipamento}
                avaliacaoExistente={(os as any).avaliacao || obterAvaliacaoPorToken(os.token || os.numero)}
                aoAvaliar={() => void carregar()}
              />
            </>
          )}

          <section className="mt-5">
            <div className="mb-3 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-cyan-400" /><h2 className="font-bold">Fotos do reparo</h2></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[{ label: "Antes", src: os.fotoAntes }, { label: "Depois", src: os.fotoDepois }].map((foto) => (
                <div key={foto.label} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="border-b border-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">{foto.label}</div>
                  {foto.src ? <img src={foto.src} loading="lazy" decoding="async" alt={`Foto ${foto.label.toLowerCase()} do aparelho`} className="h-52 w-full object-contain bg-slate-950 p-2" /> : <div className="flex h-52 items-center justify-center text-sm text-slate-500">Foto ainda não adicionada</div>}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 mb-5">
            <ChatOS token={os.token} remetente="cliente" />
          </section>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Status conectado em tempo real</span>
            </div>
            <span>SOS Reparo</span>
          </div>
        </section>
      </main>

      <ModalAssinaturaEntrega
        aberto={modalAssinatura}
        aoFechar={() => setModalAssinatura(false)}
        os={os}
        aoSucesso={() => void carregar()}
      />

      <ModalVisualizarAssinatura
        aberto={modalVisualizar}
        aoFechar={() => setModalVisualizar(false)}
        os={os}
      />
    </div>
  );
}
