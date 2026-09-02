import { Layout } from "@/components/Layout";
import { History, Search, CheckCircle2, Calendar, User, Wrench, DollarSign, PackageCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { equipamentos as equipamentosIniciais } from "@/lib/dados";
import { MarcaLogo } from "@/components/MarcaLogo";

export function HistoricoPage() {
  const [busca, setBusca] = useState("");
  const [historico, setHistorico] = useState<any[]>([]);

  const carregar = () => {
    try {
      // 1. Itens locais (cadastrados pelo usuário) com status Entregue
      const salvo = localStorage.getItem("sos_clientes");
      const clientesLocais: any[] = salvo ? JSON.parse(salvo) : [];
      const locaisEntregues = clientesLocais
        .filter((c: any) => c.os && c.os.statusOS === "Entregue")
        .map((c: any) => ({
          id: `EQ-${c.id}`,
          numero: c.os.numero,
          cliente: c.nome,
          telefone: c.telefone || "-",
          equipamento: `${c.os.marca} ${c.os.modelo}`.trim(),
          marca: c.os.marca,
          modelo: c.os.modelo,
          tipo: c.os.tipoAparel,
          servico: c.os.servico || "Análise",
          tecnico: c.os.tecnico || "-",
          dataEntrada: c.os.dataEntrada || "-",
          dataEntrega: c.os.dataRetirada || "-",
          horaEntrega: c.os.horaRetirada || "",
          valor: c.os.valor || "-",
          fotoLocal: c.os.fotoEquipamento,
        }));

      // 2. Itens estáticos que foram editados para Entregue via sos_eq_static_edits
      const staticSalvo = localStorage.getItem("sos_eq_static_edits");
      const staticEdits: Record<string, any> = staticSalvo ? JSON.parse(staticSalvo) : {};
      const staticEntregues = equipamentosIniciais
        .filter(e => staticEdits[e.id]?.status === "Entregue")
        .map(e => {
          const edit = staticEdits[e.id];
          return {
            id: e.id,
            numero: `OS-EST-${e.id}`,
            cliente: e.cliente,
            telefone: "-",
            equipamento: `${e.marca} ${e.modelo}`.trim(),
            marca: e.marca,
            modelo: e.modelo,
            tipo: e.tipo,
            servico: edit.servico || "-",
            tecnico: edit.tecnico || "-",
            dataEntrada: "-",
            dataEntrega: edit.dataRetirada || "-",
            horaEntrega: edit.horaRetirada || "",
            valor: edit.valor || "-",
            fotoLocal: undefined,
          };
        });

      const todos = [...locaisEntregues, ...staticEntregues];
      const unicos = todos.filter((v, i, a) => a.findIndex(t => t.numero === v.numero) === i);
      setHistorico(unicos);
    } catch { setHistorico([]); }
  };

  useEffect(() => {
    carregar();
    window.addEventListener("focus", carregar);
    window.addEventListener("storage", carregar);
    window.addEventListener("sos-firebase-update", carregar);
    return () => {
      window.removeEventListener("focus", carregar);
      window.removeEventListener("storage", carregar);
      window.removeEventListener("sos-firebase-update", carregar);
    };
  }, []);

  const filtrado = historico.filter((h: any) =>
    h.numero.toLowerCase().includes(busca.toLowerCase()) ||
    h.cliente.toLowerCase().includes(busca.toLowerCase()) ||
    h.equipamento.toLowerCase().includes(busca.toLowerCase()) ||
    h.telefone.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Histórico de Entregas</h2>
            <p className="text-sm text-muted-foreground">
              Aparelhos já entregues ao cliente — {historico.length} no total.
            </p>
          </div>
          {historico.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">{historico.length} entregues</span>
            </div>
          )}
        </div>

        {/* Busca */}
        {historico.length > 0 && (
          <div className="relative max-w-sm group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por OS, cliente, equipamento..."
              className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        )}

        {/* Lista */}
        {historico.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-border bg-card text-center shadow-sm">
            <PackageCheck className="h-14 w-14 text-muted-foreground/30 mb-4" />
            <p className="text-base font-semibold text-foreground">Nenhum aparelho entregue ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Quando um aparelho for marcado como "Entregue", ele aparecerá aqui automaticamente.
            </p>
          </div>
        ) : filtrado.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground shadow-sm">
            Nenhum resultado para <span className="font-bold text-foreground">"{busca}"</span>.
          </div>
        ) : (
          <div className="space-y-4">
            {filtrado.map((h: any, i: number) => (
              <div key={h.numero + i} className="group relative flex flex-col lg:flex-row items-stretch gap-0 rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-emerald-500/40 hover:-translate-y-1">
                <div className="w-1.5 shrink-0 bg-emerald-500 transition-colors group-hover:bg-emerald-400" />
                
                <div className="flex flex-1 flex-col lg:flex-row p-5 gap-6 lg:items-center">
                  {/* Foto & Info Principal */}
                  <div className="flex min-w-0 flex-1 items-center gap-4 lg:min-w-[260px]">
                    <div className="relative shrink-0">
                      {h.fotoLocal || h.marca ? (
                        <img
                          src={h.fotoLocal || `${import.meta.env.BASE_URL}fotos/${h.marca} ${h.modelo}.webp`}
                          alt={h.equipamento}
                          loading="lazy"
                          decoding="async"
                          className="h-14 w-14 rounded-xl object-cover shadow-sm ring-1 ring-border group-hover:ring-emerald-500/50 transition-all"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove("hidden");
                            (e.currentTarget.nextElementSibling as HTMLElement)?.classList.add("flex");
                          }}
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted ring-1 ring-border group-hover:ring-emerald-500/50 transition-all">
                           <PackageCheck className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="hidden h-14 w-14 items-center justify-center rounded-xl bg-muted ring-1 ring-border group-hover:ring-emerald-500/50 transition-all">
                         <PackageCheck className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-1 ring-border shadow-sm text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md tracking-wide">{h.numero}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h.tipo}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-2">
                        <MarcaLogo marca={h.marca || h.equipamento.split(" ")[0]} tamanho="sm" />
                        <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">{h.equipamento}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="font-medium truncate max-w-[180px]">{h.cliente}</span>
                        <span className="text-muted-foreground/50 mx-0.5">•</span>
                        <span>{h.telefone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Serviço & Técnico */}
                  <div className="flex min-w-0 flex-col gap-2 lg:min-w-[200px] lg:border-l lg:border-border/50 lg:pl-6">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Serviço</p>
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium truncate max-w-[180px]">{h.servico}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Técnico</p>
                      <span className="inline-flex text-[11px] font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md border border-border/50">{h.tecnico}</span>
                    </div>
                  </div>

                  {/* Datas & Valores */}
                  <div className="flex min-w-0 flex-col gap-2 lg:min-w-[160px] lg:border-l lg:border-border/50 lg:pl-6">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Entrada</p>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">{h.dataEntrada}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {(() => {
                          const valStr = String(h.valor);
                          if (valStr.toLowerCase().includes('orçar') || valStr.toLowerCase().includes('combinar') || valStr === '-') return valStr;
                          const apenasNumeros = valStr.replace(/[^\d.,]/g, '').replace(',', '.');
                          const num = parseFloat(apenasNumeros);
                          return isNaN(num) ? valStr : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Entregue (Status) */}
                  <div className="flex min-w-0 flex-row items-center justify-between gap-2 border-t border-border/50 pt-4 lg:mt-0 lg:min-w-[140px] lg:flex-col lg:items-end lg:justify-center lg:border-l lg:border-t-0 lg:border-border/50 lg:pl-6 lg:pt-0">
                    <div className="flex flex-col items-start lg:items-end gap-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 ring-1 ring-emerald-500/20 shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        ENTREGUE
                      </span>
                      <p className="text-[11px] font-medium text-emerald-700/80 tracking-wide mt-1 lg:text-right">
                        {h.dataEntrega} {h.horaEntrega ? `às ${h.horaEntrega}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
