import { Layout } from "@/components/Layout";
import { DollarSign, TrendingUp, MonitorSmartphone, CheckCircle2, CalendarRange, Star, MessageSquareHeart } from "lucide-react";
import { equipamentos as equipamentosIniciais } from "@/lib/dados";
import { ordensIniciais } from "./ordens-servico";
import { useAuth } from "@/components/AuthProvider";
import { Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { obterTodasAvaliacoes, calcularMetricasSatisfacao, type AvaliacaoOS } from "@/lib/avaliacoes";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"];

export function DashboardPage() {
  const { role } = useAuth();

  if (role === "funcionario") {
    return <Navigate to="/clientes" replace />;
  }

  const [stats, setStats] = useState({
    faturamento: 0,
    ticketMedio: 0,
    aparelhosAtivos: 0,
    concluidos: 0,
    taxaConclusao: 0,
  });
  const [periodo, setPeriodo] = useState<"todos" | "dia" | "semana" | "mes">("todos");
  const [dataReferencia, setDataReferencia] = useState("");
  const [versaoDados, setVersaoDados] = useState(0);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoOS[]>([]);

  const [graficoStatus, setGraficoStatus] = useState<any[]>([]);
  const [graficoDefeitos, setGraficoDefeitos] = useState<any[]>([]);

  useEffect(() => {
    const atualizarDados = () => {
      setVersaoDados((versao) => versao + 1);
      setAvaliacoes(obterTodasAvaliacoes());
    };
    setAvaliacoes(obterTodasAvaliacoes());
    window.addEventListener("sos-firebase-update", atualizarDados);
    window.addEventListener("sos-avaliacao-nova", atualizarDados);
    window.addEventListener("storage", atualizarDados);
    window.addEventListener("focus", atualizarDados);
    return () => {
      window.removeEventListener("sos-firebase-update", atualizarDados);
      window.removeEventListener("sos-avaliacao-nova", atualizarDados);
      window.removeEventListener("storage", atualizarDados);
      window.removeEventListener("focus", atualizarDados);
    };
  }, []);

  const metricasSatisfacao = calcularMetricasSatisfacao(avaliacoes);

  useEffect(() => {
    let ordensLocais: any[] = [];
    try {
      const salvo = localStorage.getItem("sos_clientes");
      if (salvo) {
        const clientesStr = JSON.parse(salvo);
        ordensLocais = clientesStr
          .filter((c: any) => c.os)
          .map((c: any) => ({
            numero: c.os.numero,
            status: c.os.statusOS,
            valor: parseFloat(String(c.os.valor).replace(/[^\d,]/g, "").replace(",", ".")) || 0,
            tipo: c.os.tipoAparel,
            defeito: c.os.defeito || "Outros",
            dataEntrada: c.os.dataEntrada,
          }));
      }
    } catch {}

    const staticSalvo = localStorage.getItem("sos_eq_static_edits");
    const staticEdits: Record<string, any> = staticSalvo ? JSON.parse(staticSalvo) : {};

    const iniciais = ordensIniciais.map((o) => {
      const eq = equipamentosIniciais.find(
        (e) => `${e.marca} ${e.modelo}`.trim() === o.equipamento
      );
      let overrideStatus = o.status;
      if (eq && staticEdits[eq.id]) {
        overrideStatus = staticEdits[eq.id].status || o.status;
      }
      return {
        numero: o.numero,
        status: overrideStatus,
        valor: parseFloat(String(o.valor).replace(/[^\d,]/g, "").replace(",", ".")) || 0,
        tipo: o.tipo,
        defeito: o.servico,
        dataEntrada: o.abertura,
      };
    });

    const todasMerge = [...ordensLocais, ...iniciais];
    const todasOrdens = todasMerge.filter((v, i, a) => a.findIndex(t => t.numero === v.numero) === i);

    const parseData = (valor: string) => {
      const partes = String(valor || "").split("/");
      if (partes.length !== 3) return null;
      const data = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
      return Number.isNaN(data.getTime()) ? null : data;
    };
    const datasOrdenadas = todasOrdens.map((os) => parseData(os.dataEntrada)).filter(Boolean) as Date[];
    const ultimaData = datasOrdenadas.reduce((maior, atual) => atual > maior ? atual : maior, new Date(2000, 0, 1));
    const referencia = dataReferencia ? new Date(`${dataReferencia}T12:00:00`) : ultimaData;
    const mesmoDia = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const inicioSemana = new Date(referencia);
    const diaDaSemana = (referencia.getDay() + 6) % 7;
    inicioSemana.setDate(referencia.getDate() - diaDaSemana);
    inicioSemana.setHours(0, 0, 0, 0);
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);
    const ordensFiltradas = periodo === "todos" ? todasOrdens : todasOrdens.filter((os) => {
      const data = parseData(os.dataEntrada);
      if (!data) return false;
      if (periodo === "dia") return mesmoDia(data, referencia);
      if (periodo === "semana") return data >= inicioSemana && data <= fimSemana;
      return data.getFullYear() === referencia.getFullYear() && data.getMonth() === referencia.getMonth();
    });

    // Cálculos de KPIs
    let faturamento = 0;
    let concluidos = 0;
    let ativos = 0;
    let totalValorizados = 0;

    const contagemStatus: Record<string, number> = {
      "Em reparo": 0, "Aguardando peça": 0, "Aguardando": 0, "Em análise": 0
    };
    const contagemTipos: Record<string, number> = {};

    ordensFiltradas.forEach(os => {
      const isConcluido = os.status === "Concluído" || os.status === "Pronto" || os.status === "Entregue";
      if (isConcluido) {
        concluidos++;
        faturamento += os.valor;
        if (os.valor > 0) totalValorizados++;
      } else {
        ativos++;
        if (contagemStatus[os.status] !== undefined) {
          contagemStatus[os.status]++;
        } else {
          contagemStatus["Aguardando"] = (contagemStatus["Aguardando"] || 0) + 1;
        }
      }

      // Tipos para gráfico de pizza
      const tipoReal = os.tipo || "Outros";
      contagemTipos[tipoReal] = (contagemTipos[tipoReal] || 0) + 1;
    });

    const total = ativos + concluidos;
    
    setStats({
      faturamento,
      ticketMedio: totalValorizados > 0 ? faturamento / totalValorizados : 0,
      aparelhosAtivos: ativos,
      concluidos,
      taxaConclusao: total > 0 ? Math.round((concluidos / total) * 100) : 0,
    });

    // Formatar dados para recharts
    setGraficoStatus(Object.entries(contagemStatus).map(([name, value]) => ({ name, value })));
    
    // Pegar top 5 tipos e agrupar o resto em "Outros"
    const tiposArray = Object.entries(contagemTipos).sort((a, b) => b[1] - a[1]);
    const topTipos = tiposArray.slice(0, 5).map(([name, value]) => ({ name, value }));
    const outrosTipos = tiposArray.slice(5).reduce((acc, curr) => acc + curr[1], 0);
    if (outrosTipos > 0) topTipos.push({ name: "Outros", value: outrosTipos });
    
    setGraficoDefeitos(topTipos);

  }, [periodo, dataReferencia, versaoDados]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Analytics</h2>
          <p className="text-sm text-muted-foreground">Visão gerencial de faturamento e desempenho da assistência técnica.</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><CalendarRange className="h-4 w-4 text-primary" /> Período dos indicadores</div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={periodo} onChange={(event) => setPeriodo(event.target.value as typeof periodo)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="todos">Todo o período</option>
              <option value="dia">Por dia</option>
              <option value="semana">Por semana</option>
              <option value="mes">Por mês</option>
            </select>
            {periodo !== "todos" && <input type="date" value={dataReferencia} onChange={(event) => setDataReferencia(event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" aria-label="Data de referência" />}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento (Realizado)</p>
                <p className="mt-2 text-3xl font-black text-emerald-600">{formatCurrency(stats.faturamento)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>Baseado em OS entregues/concluídas</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="mt-2 text-3xl font-black text-blue-600">{formatCurrency(stats.ticketMedio)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">Média gasta por cliente</div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aparelhos na Fila</p>
                <p className="mt-2 text-3xl font-black text-amber-600">{stats.aparelhosAtivos}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <MonitorSmartphone className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">Total de serviços em andamento</div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">OS Concluídas</p>
                <p className="mt-2 text-3xl font-black text-indigo-600">{stats.concluidos}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">Taxa global de sucesso: {stats.taxaConclusao}%</div>
          </div>

          {/* ⭐ 5º KPI: Índice de Satisfação do Cliente (NPS) */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/15 blur-2xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfação (NPS)</p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-amber-500">{metricasSatisfacao.media.toFixed(1)}</span>
                  <span className="text-xs font-semibold text-muted-foreground">/ 5.0</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Star className="h-6 w-6 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                {"★".repeat(Math.min(5, Math.round(metricasSatisfacao.media)))}
                <span className="text-muted-foreground font-normal ml-1">({metricasSatisfacao.total} avaliações)</span>
              </span>
              <span className="font-bold text-emerald-600">{metricasSatisfacao.percentualPositivo}% positivo</span>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Gráfico 1: OS na fila por Status */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-1">Gargalo Operacional</h3>
            <p className="text-xs text-muted-foreground mb-6">Volume de aparelhos atualmente divididos por status</p>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graficoStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {graficoStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2: Tipos mais consertados */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-1">Tipos de Equipamentos</h3>
            <p className="text-xs text-muted-foreground mb-6">Distribuição histórica das entradas de aparelhos</p>
            
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={graficoDefeitos}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {graficoDefeitos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ⭐ Feed de Satisfação & Avaliações dos Clientes em Tempo Real */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">Pesquisa de Satisfação em Tempo Real</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-500 border border-amber-500/25">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {metricasSatisfacao.media.toFixed(1)} / 5.0 Estrelas
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Avaliações e elogios preenchidos pelos clientes ao confirmarem a retirada do aparelho
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Atualização instantânea</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {avaliacoes.slice(0, 6).map((av, idx) => (
              <div
                key={av.tokenOS || idx}
                className="rounded-2xl border border-border bg-background/60 p-4 flex flex-col justify-between shadow-xs hover:border-amber-400/40 hover:bg-background transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-foreground">{av.cliente}</p>
                      <p className="text-xs text-muted-foreground">{av.equipamento}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= av.estrelas
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]"
                              : "fill-muted text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {av.elogio && (
                    <p className="mt-3 text-xs italic text-foreground/90 bg-muted/40 p-2.5 rounded-xl border border-border/60">
                      "{av.elogio}"
                    </p>
                  )}

                  {av.tags && av.tags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {av.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-lg border border-border/80 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-semibold text-primary">{av.numeroOS}</span>
                  <span>{av.dataFmt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}
