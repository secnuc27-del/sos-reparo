import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Search,
  ClipboardList,
  Clock,
  CheckCircle2,
  Wrench,
  User,
  Monitor,
  Calendar,
  DollarSign,
  Hash,
  Trash2,
  QrCode,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { equipamentos as equipamentosIniciais } from "@/lib/dados";
import { salvarClientesFirebase } from "@/lib/firebaseSync";
import { QRCodeSVG } from "qrcode.react";
import { criarRegistroOSPublica, salvarOSPublica, tokenOSPublica, urlOSPublica } from "@/lib/osPublica";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.479-8.413" />
    </svg>
  );
}

const fotoEquipamento: Record<string, string> = {
  "Dell Inspiron 15 3511": `${import.meta.env.BASE_URL}fotos/Dell Inspiron 15 3511.webp`,
  "Samsung Galaxy A54": `${import.meta.env.BASE_URL}fotos/Samsung Galaxy A54.webp`,
  "HP LaserJet M404": `${import.meta.env.BASE_URL}fotos/HP LaserJet M404.webp`,
  "Positivo Master D3400": `${import.meta.env.BASE_URL}fotos/Positivo Master D3400.webp`,
  "iPad 9ª Geração": `${import.meta.env.BASE_URL}fotos/Apple iPad 9ª Geração.webp`,
  "PlayStation 5": `${import.meta.env.BASE_URL}fotos/Sony PlayStation 5.webp`,
  "iphone 16 pro max": `${import.meta.env.BASE_URL}fotos/iphone 16 pro max.webp`,
  "Sony PlayStation 5": `${import.meta.env.BASE_URL}fotos/Sony PlayStation 5.webp`,
};

// Parse DD/MM/YYYY to a Date for sorting (older = higher priority in queue)
const parseDate = (dateStr: string): Date => {
  if (!dateStr || dateStr === "-") return new Date(9999, 0, 1);
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date(9999, 0, 1);
};

export const ordensIniciais = [
  {
    id: "static-1",
    numero: "OS-2026-0142",
    cliente: "Maria Silva",
    telefone: "(68) 99999-1234",
    equipamento: "Dell Inspiron 15 3511",
    tipo: "Notebook",
    servico: "Troca de placa-mãe",
    tecnico: "Rafael M.",
    abertura: "20/08/2026",
    hora: "09:14",
    previsao: "28/08/2026",
    valor: "R$ 680,00",
    status: "Em reparo",
  },
  {
    id: "static-2",
    numero: "OS-2026-0143",
    cliente: "Fernanda Lima",
    telefone: "(68) 95555-7890",
    equipamento: "iPad 9ª Geração",
    tipo: "Tablet",
    servico: "Troca de bateria",
    tecnico: "Carlos T.",
    abertura: "19/08/2026",
    hora: "10:00",
    previsao: "25/08/2026",
    valor: "R$ 350,00",
    status: "Pronto",
  },
  {
    id: "static-3",
    numero: "OS-2026-0144",
    cliente: "João Pereira",
    telefone: "(68) 98888-5678",
    equipamento: "Samsung Galaxy A54",
    tipo: "Smartphone",
    servico: "Troca de tela",
    tecnico: "Rafael M.",
    abertura: "22/08/2026",
    hora: "08:30",
    previsao: "27/08/2026",
    valor: "R$ 420,00",
    status: "Aguardando peça",
  },
  {
    id: "static-4",
    numero: "OS-2026-0145",
    cliente: "Roberto Alves",
    telefone: "(68) 94444-2345",
    equipamento: "PlayStation 5",
    tipo: "Console",
    servico: "Troca de HDMI",
    tecnico: "Carlos T.",
    abertura: "23/08/2026",
    hora: "10:00",
    previsao: "29/08/2026",
    valor: "R$ 290,00",
    status: "Em reparo",
  },
  {
    id: "static-5",
    numero: "OS-2026-0147",
    cliente: "Pedro Mendes",
    telefone: "(68) 92222-9988",
    equipamento: "iphone 16 pro max",
    tipo: "Smartphone",
    servico: "Troca de microfone",
    tecnico: "Rafael M.",
    abertura: "20/08/2026",
    hora: "08:00",
    previsao: "27/08/2026",
    valor: "R$ 250,00",
    status: "Pronto",
  },
  {
    id: "static-6",
    numero: "OS-2026-0150",
    cliente: "Carlos Souza",
    telefone: "(68) 96666-3456",
    equipamento: "Positivo Master D3400",
    tipo: "Desktop",
    servico: "Limpeza interna e troca de pasta térmica",
    tecnico: "Rafael M.",
    abertura: "22/08/2026",
    hora: "13:00",
    previsao: "29/08/2026",
    valor: "R$ 160,00",
    status: "Em reparo",
  },
];

export function OrdensPage({ apenasProntas = false }: { apenasProntas?: boolean }) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos os status");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [qrOs, setQrOs] = useState<{ registro: any; link: string } | null>(null);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const carregarOrdens = () => {
    let ordensLocais: any[] = [];
    try {
      const salvo = localStorage.getItem("sos_clientes");
      if (salvo) {
        const clientesStr = JSON.parse(salvo);
        ordensLocais = clientesStr
          .filter((c: any) => c.os)  // all clients with an OS
          .map((c: any) => ({
            id: `local-${c.id}`,
            clienteId: c.id,
            numero: c.os.numero,
            cliente: c.nome,
            telefone: c.telefone || "",
            equipamento: `${c.os.marca} ${c.os.modelo}`.trim(),
            tipo: c.os.tipoAparel,
            servico: c.os.servico,
            tecnico: c.os.tecnico,
            abertura: c.os.dataEntrada,
            hora: c.os.horaEntrada || "-",
            previsao: c.os.dataRetirada || "-",
            valor: c.os.valor,
            status: c.os.statusOS,
            fotoLocal: c.os.fotoEquipamento,
            fotoAntes: c.os.fotoAntes || c.os.fotoEquipamento,
            fotoDepois: c.os.fotoDepois || "",
            publicToken: c.os.publicToken,
            aprovacaoOrcamento: c.os.aprovacaoOrcamento || "pendente",
            assinaturaEntrega: c.os.assinaturaEntrega || "",
            defeito: c.os.defeito || "",
            dataEntradaDate: parseDate(c.os.dataEntrada),
          }));
      }
    } catch {}

    const staticSalvo = localStorage.getItem("sos_eq_static_edits");
    const staticEdits: Record<string, any> = staticSalvo ? JSON.parse(staticSalvo) : {};

    // Sort iniciais with a parsed date too
    const iniciaisComData = ordensIniciais.map((o) => {
      // Check if this static order was edited
      const eq = equipamentosIniciais.find(
        (e) => `${e.marca} ${e.modelo}`.trim() === o.equipamento
      );
      const staticEdit = eq ? staticEdits[eq.id] || {} : {};
      let overrideStatus = o.status;
      if (eq && staticEdits[eq.id]) {
        overrideStatus = staticEdits[eq.id].status || o.status;
      }
      return {
        ...o,
        status: overrideStatus,
        fotoAntes: staticEdit.fotoAntes || "",
        fotoDepois: staticEdit.fotoDepois || "",
        publicToken: tokenOSPublica(o.numero),
        aprovacaoOrcamento: staticEdit.aprovacaoOrcamento || "pendente",
        assinaturaEntrega: staticEdit.assinaturaEntrega || "",
        dataEntradaDate: parseDate(o.abertura),
      };
    });

    // Merge: locals first + iniciais
    const mesclado = [...ordensLocais, ...iniciaisComData];
    
    // Deduplicate by OS number (numero) keeping the local edit first
    const unicos = mesclado.filter((v, i, a) => a.findIndex(t => t.numero === v.numero) === i);

    // Sort ALL by entry date ascending (oldest first = highest priority)
    const finalSort = unicos.sort(
      (a, b) => a.dataEntradaDate.getTime() - b.dataEntradaDate.getTime()
    );

    return finalSort;
  };

  const excluirOS = (os: any) => {
    setConfirmDelete(null);
    return;
    if (!os.clienteId) {
      setConfirmDelete(null);
      return; // can't delete static entries
    }
    try {
      const salvo = localStorage.getItem("sos_clientes");
      if (salvo) {
        const clientes = JSON.parse(salvo);
        const novos = clientes.filter((c: any) => c.id !== os.clienteId);
        localStorage.setItem("sos_clientes", JSON.stringify(novos));
        void salvarClientesFirebase(novos);
      }
    } catch {}
    setConfirmDelete(null);
    window.location.reload();
  };

  const abrirQrCode = (os: any) => {
    const token = tokenOSPublica(os.numero, os.publicToken);
    const registro = criarRegistroOSPublica(os, token);
    const link = urlOSPublica(token);
    void salvarOSPublica(registro);
    setQrOs({ registro, link });
    setLinkCopiado(false);
  };

  const [ordens, setOrdens] = useState<any[]>([]);

  useEffect(() => {
    setOrdens(carregarOrdens());
    
    const onStorageChange = () => {
      setOrdens(carregarOrdens());
    };
    
    window.addEventListener("storage", onStorageChange);
    window.addEventListener("focus", onStorageChange);
    window.addEventListener("sos-firebase-update", onStorageChange);
    return () => {
      window.removeEventListener("storage", onStorageChange);
      window.removeEventListener("focus", onStorageChange);
      window.removeEventListener("sos-firebase-update", onStorageChange);
    };
  }, []);

  useEffect(() => {
    const limparModoImpressao = () => document.body.classList.remove("printing-qr");
    window.addEventListener("afterprint", limparModoImpressao);
    return () => window.removeEventListener("afterprint", limparModoImpressao);
  }, []);

  const imprimirQrCode = () => {
    document.body.classList.add("printing-qr");
    window.setTimeout(() => window.print(), 80);
  };

  const ordensVisiveis = apenasProntas
    ? ordens.filter((o) => o.status === "Pronto")
    : ordens;

  // Active = not Entregue; separate them
  const ordensAtivas = ordensVisiveis.filter(o => o.status !== "Entregue");
  const ordensEntregues = ordensVisiveis.filter(o => o.status === "Entregue");
  const statusAtual = apenasProntas ? "Pronto" : filtroStatus;

  const filtrarLista = (lista: any[]) =>
    lista.filter((os) => {
      const matchBusca =
        os.numero.toLowerCase().includes(busca.toLowerCase()) ||
        os.cliente.toLowerCase().includes(busca.toLowerCase()) ||
        os.equipamento.toLowerCase().includes(busca.toLowerCase());
      const matchStatus =
        statusAtual === "Todos os status" || os.status === statusAtual;
      return matchBusca && matchStatus;
    });

  const ativasFiltradas = filtrarLista(ordensAtivas);
  const entreguesFiltradas = filtrarLista(ordensEntregues);
  const todasFiltradas = filtrarLista(ordens);

  const stats = apenasProntas
    ? [
        { label: "Prontos para retirada", valor: ordensVisiveis.length, icon: CheckCircle2, cor: "bg-success text-success-foreground" },
      ]
    : [
        { label: "OS abertas", valor: ordens.filter(o => o.status !== "Concluído" && o.status !== "Pronto" && o.status !== "Entregue").length, icon: ClipboardList, cor: "bg-info text-info-foreground" },
        { label: "Em reparo", valor: ordens.filter(o => o.status === "Em reparo").length, icon: Wrench, cor: "bg-warning text-warning-foreground" },
        { label: "Aguardando peça", valor: ordens.filter(o => o.status === "Aguardando peça").length, icon: Clock, cor: "bg-secondary text-secondary-foreground" },
        { label: "Concluídas/Entregues", valor: ordens.filter(o => o.status === "Concluído" || o.status === "Pronto" || o.status === "Entregue").length, icon: CheckCircle2, cor: "bg-success text-success-foreground" },
      ];

  const renderCard = (os: any, posicao: number) => {
    const isConcluido = os.status === "Concluído" || os.status === "Pronto" || os.status === "Entregue";

    return (
      <div
        key={os.numero + os.id}
        className="group relative flex flex-col lg:flex-row items-stretch gap-0 rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1"
      >
        <div className={`w-1.5 shrink-0 transition-colors ${isConcluido ? 'bg-emerald-500 group-hover:bg-emerald-400' : 'bg-primary/70 group-hover:bg-primary'}`} />

        {/* Posição na fila */}
        <div className="flex flex-row lg:flex-col items-center justify-center bg-muted/40 px-6 py-4 lg:min-w-[100px] border-b lg:border-b-0 lg:border-r border-border gap-2 lg:gap-1">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Fila</span>
          <span className="text-3xl font-black text-primary leading-none">#{posicao}</span>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row p-5 gap-6 lg:items-center">
          {/* Foto & Info Principal */}
          <div className="flex min-w-0 flex-1 items-center gap-4 lg:min-w-[260px]">
            <div className="relative shrink-0">
              {os.fotoLocal || fotoEquipamento[os.equipamento] ? (
                <img
                  src={os.fotoLocal || fotoEquipamento[os.equipamento]}
                  alt={os.equipamento}
                  className="h-14 w-14 rounded-xl object-cover shadow-sm ring-1 ring-border group-hover:ring-primary/50 transition-all"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted ring-1 ring-border group-hover:ring-primary/50 transition-all">
                  <span className="text-2xl">🔧</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-1 ring-border shadow-sm text-primary">
                <Monitor className="h-3 w-3" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md tracking-wide">{os.numero}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{os.tipo}</span>
              </div>
              <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">{os.equipamento}</p>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="font-medium truncate max-w-[180px]">{os.cliente}</span>
              </div>
            </div>
          </div>

          {/* Serviço & Técnico */}
          <div className="flex min-w-0 flex-col gap-2 lg:min-w-[200px] lg:border-l lg:border-border/50 lg:pl-6">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Serviço</p>
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium truncate max-w-[180px]">{os.servico}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Técnico</p>
              <span className="inline-flex text-[11px] font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md border border-border/50">{os.tecnico}</span>
            </div>
          </div>

          {/* Datas & Valores */}
          <div className="flex min-w-0 flex-col gap-2 lg:min-w-[160px] lg:border-l lg:border-border/50 lg:pl-6">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Entrada</p>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{os.abertura}</span>
                <span className="text-[11px] bg-primary/15 text-primary rounded-md px-2 py-0.5 font-mono font-bold tracking-wider shadow-sm border border-primary/20">{os.hora}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                {(() => {
                  const valStr = String(os.valor);
                  if (valStr.toLowerCase().includes('orçar') || valStr.toLowerCase().includes('combinar')) return valStr;
                  const apenasNumeros = valStr.replace(/[^\d.,]/g, '').replace(',', '.');
                  const num = parseFloat(apenasNumeros);
                  return isNaN(num) ? valStr : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
                })()}
              </span>
            </div>
          </div>

          {/* Status + Ações */}
          <div className="flex min-w-0 flex-row items-center justify-between gap-2 border-t border-border/50 pt-4 lg:mt-0 lg:min-w-[140px] lg:flex-col lg:items-end lg:justify-center lg:border-l lg:border-t-0 lg:border-border/50 lg:pl-6 lg:pt-0">
            <div className="flex flex-col items-start lg:items-end gap-1">
              <StatusBadge status={os.status} />
              <p className="text-[10px] font-medium text-muted-foreground tracking-wide mt-1">Prev: <span className="text-foreground">{os.previsao}</span></p>
            </div>
            <div className="flex items-center gap-1 lg:mt-2">
              <button
                onClick={() => abrirQrCode(os)}
                className="rounded-lg bg-primary/10 p-2 text-primary transition-all hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                title="Gerar QR Code de acompanhamento"
              >
                <QrCode className="h-4 w-4" />
              </button>
              {os.status === "Pronto" && (
                <button
                  onClick={() => {
                    const texto = `Olá ${os.cliente}, sua Ordem de Serviço ${os.numero} referente ao ${os.equipamento} acabou de ser concluída e está pronta para retirada!`;
                    const num = (os.telefone || "").replace(/\D/g, "");
                    const zap = num ? (num.startsWith("55") ? num : `55${num}`) : "";
                    const url = `https://wa.me/${zap}?text=${encodeURIComponent(texto)}`;
                    window.open(url, '_blank');
                  }}
                  className="p-2 rounded-lg text-emerald-500 bg-emerald-500/10 hover:text-white hover:bg-emerald-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm"
                  title="Avisar cliente pelo WhatsApp"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                </button>
              )}
              {false && os.clienteId && (
                <button
                  onClick={() => setConfirmDelete(os.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  title="Excluir OS"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal de confirmação de delete */}
        {false && confirmDelete === os.id && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-2xl">
            <div className="bg-card border border-border rounded-xl p-6 shadow-xl text-center max-w-xs mx-4 animate-in zoom-in-95 duration-200">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mb-4">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-base font-bold text-foreground mb-1">Excluir OS {os.numero}?</p>
              <p className="text-xs text-muted-foreground mb-6">Esta ação não pode ser desfeita e removerá o registro permanentemente.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 rounded-lg border border-border py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => excluirOS(os)}
                  className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-bold text-white hover:bg-red-600 transition-colors shadow-sm"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {apenasProntas ? "Aparelhos Prontos" : "Fila de Serviços"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {apenasProntas
                ? `${ordensVisiveis.length} OS prontas para retirada pelo cliente`
                : `Ordenadas por data de entrada (mais antigas primeiro) — ${ordensAtivas.length} ativas`}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${s.cor}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-black text-foreground tracking-tight">{s.valor}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="relative w-full min-w-0 max-w-sm flex-1 sm:min-w-52">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por número, cliente, equipamento..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {!apenasProntas && (
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option>Todos os status</option>
              <option>Aguardando</option>
              <option>Em análise</option>
              <option>Em reparo</option>
              <option>Aguardando peça</option>
              <option>Concluído</option>
              <option>Pronto</option>
              <option>Entregue</option>
            </select>
          )}
        </div>

        {/* Fila ativa */}
        <div className="space-y-3">
          {ativasFiltradas.length === 0 && statusAtual !== "Entregue" && (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border bg-card">
              <ClipboardList className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">Nenhuma OS ativa encontrada</p>
              <p className="text-xs text-muted-foreground mt-1">Tente ajustar os filtros de busca.</p>
            </div>
          )}
          {ativasFiltradas.map((os, idx) => renderCard(os, idx + 1))}
        </div>

        {/* Seção de Entregues */}
        {(entreguesFiltradas.length > 0 || filtroStatus === "Entregue") && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                ✓ Entregues ao Cliente
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            {entreguesFiltradas.map((os, idx) => renderCard(os, idx + 1))}
          </div>
        )}
      </div>

      {qrOs && typeof document !== "undefined" && createPortal(
        (
        <div className="qr-print-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="qr-print-card w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Acompanhamento pelo celular</p>
                <h3 className="mt-1 text-xl font-bold text-foreground">QR Code da {qrOs.registro.numero}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{qrOs.registro.cliente} · {qrOs.registro.equipamento}</p>
              </div>
              <button onClick={() => setQrOs(null)} className="qr-print-close rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">×</button>
            </div>

            <div className="mx-auto my-6 flex w-fit rounded-2xl bg-white p-4 shadow-inner">
              <QRCodeSVG value={qrOs.link} size={220} bgColor="#ffffff" fgColor="#0f172a" includeMargin />
            </div>
            <p className="text-center text-xs text-muted-foreground">O cliente escaneia e acompanha o status, fotos e orçamento.</p>
            <div className="qr-print-link mt-4 rounded-xl border border-border bg-muted/30 p-3 text-xs text-foreground break-all">{qrOs.link}</div>
            <div className="qr-print-actions mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button onClick={() => { void navigator.clipboard?.writeText(qrOs.link); setLinkCopiado(true); }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"><Copy className="h-4 w-4" /> {linkCopiado ? "Copiado" : "Copiar link"}</button>
              <button onClick={() => window.open(qrOs.link, "_blank")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><ExternalLink className="h-4 w-4" /> Abrir página</button>
            </div>
            <button onClick={imprimirQrCode} className="qr-print-button mt-2 w-full rounded-lg border border-dashed border-input px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Imprimir QR Code</button>
          </div>
        </div>
        ),
        document.body,
      )}
    </Layout>
  );
}
