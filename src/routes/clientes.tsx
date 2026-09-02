import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Plus, Search, Phone, Mail, Users, X, Camera, Upload,
  Wrench, CalendarDays, UserCheck, DollarSign, ClipboardList, ChevronDown, Check,
} from "lucide-react";
import { clientes as clientesIniciais } from "@/lib/dados";
import { salvarClientesFirebase } from "@/lib/firebaseSync";
import { gerarTokenOS } from "@/lib/osPublica";
import { useState, useRef, useEffect } from "react";

import {
  existemClientesPendentes,
  marcarClienteLocalPendente,
  salvarClienteFirebase,
  salvarClientesPendentesFirebase,
  salvarClientesLocal,
  iniciarSincronizacaoFirebase,
} from '@/lib/firebaseSync';

import { CATALOGO_POR_TIPO, MARCAS_COMPLETAS_POR_TIPO } from '@/lib/catalogoEquipamentos';
import { comprimirFoto, MAX_TAMANHO_FOTO_BYTES } from "@/lib/fotos";
import { MarcaLogo } from "@/components/MarcaLogo";

type OSVinculada = {
  numero: string;
  tipoAparel: string;
  marca: string;
  linha?: string;
  modelo: string;
  serial: string;
  fotoEquipamento: string;
  fotoAntes?: string;
  fotoDepois?: string;
  defeito: string;
  servico: string;
  tecnico: string;
  statusOS: string;
  dataEntrada: string;
  dataRetirada: string;
  valor: string;
  publicToken?: string;
  aprovacaoOrcamento?: "pendente" | "aprovado" | "recusado";
  assinaturaEntrega?: string;
  assinaturaEm?: string;
};

type ClienteCompleto = {
  id: number;
  codigo: string;
  nome: string;
  telefone: string;
  estado?: string;
  ddd?: string;
  email: string;
  cidade: string;
  equipamentos: number;
  status: string;
  os?: OSVinculada;
};

const STORAGE_KEY = "sos_clientes";

const carregarClientes = (): ClienteCompleto[] => {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) return JSON.parse(salvo);
  } catch {}
  return clientesIniciais as ClienteCompleto[];
};

const gerarCodigo = (lista: ClienteCompleto[]) => {
  const ultimo = lista.reduce((max, c) => {
    const num = parseInt(c.codigo.replace("CLI-", ""), 10);
    return isNaN(num) ? max : Math.max(num, max);
  }, 21);
  return `CLI-${String(ultimo + 1).padStart(4, "0")}`;
};

const gerarOS = (lista: ClienteCompleto[]) => {
  const ano = new Date().getFullYear();
  const total = lista.filter((c) => c.os).length + 151;
  return `OS-${ano}-${String(total).padStart(4, "0")}`;
};

const hoje = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

const TIPOS = ["Smartphone", "Notebook", "Desktop", "Tablet", "Console", "Impressora", "Outro"];
const STATUS_OS = ["Aguardando", "Em análise", "Em reparo", "Aguardando peça", "Concluído", "Entregue"];
const TECNICOS = ["Rafael M.", "Beatriz L.", "Diego F.", "Carlos T."];

const MARCAS_POR_TIPO: Record<string, string[]> = {
  Smartphone: ["Apple", "Samsung", "Motorola", "Xiaomi", "LG", "Asus", "Realme", "Poco", "Outra"],
  Notebook: ["Dell", "HP", "Lenovo", "Acer", "Asus", "Apple", "Samsung", "LG", "Vaio", "Positivo", "Avell", "Outra"],
  Desktop: ["Dell", "HP", "Lenovo", "Apple", "Positivo", "Montado (Custom/Gamer)", "Outra"],
  Tablet: ["Apple (iPad)", "Samsung", "Lenovo", "Xiaomi", "Multilaser", "Outra"],
  Impressora: ["HP", "Epson", "Canon", "Brother", "Samsung", "Lexmark", "Outra"],
  Console: ["PlayStation", "Xbox", "Nintendo", "Outra"],
};

const MODELOS_APPLE = [
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12", "iPhone 12 Mini", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13", "iPhone 13 Mini", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "Outro"
];

const MODELOS_SAMSUNG = [
  "Galaxy S21", "Galaxy S22", "Galaxy S23", "Galaxy S24",
  "Galaxy A34", "Galaxy A54", "Galaxy M54",
  "Outro"
];

const ESTADOS_BR = [
  { sigla: 'AC', nome: 'Acre', ddds: ['68'] },
  { sigla: 'AL', nome: 'Alagoas', ddds: ['82'] },
  { sigla: 'AP', nome: 'Amapá', ddds: ['96'] },
  { sigla: 'AM', nome: 'Amazonas', ddds: ['92', '97'] },
  { sigla: 'BA', nome: 'Bahia', ddds: ['71', '73', '74', '75', '77'] },
  { sigla: 'CE', nome: 'Ceará', ddds: ['85', '88'] },
  { sigla: 'DF', nome: 'Distrito Federal', ddds: ['61'] },
  { sigla: 'ES', nome: 'Espírito Santo', ddds: ['27', '28'] },
  { sigla: 'GO', nome: 'Goiás', ddds: ['61', '62', '64'] },
  { sigla: 'MA', nome: 'Maranhão', ddds: ['98', '99'] },
  { sigla: 'MT', nome: 'Mato Grosso', ddds: ['65', '66'] },
  { sigla: 'MS', nome: 'Mato Grosso do Sul', ddds: ['67'] },
  { sigla: 'MG', nome: 'Minas Gerais', ddds: ['31', '32', '33', '34', '35', '37', '38'] },
  { sigla: 'PA', nome: 'Pará', ddds: ['91', '93', '94'] },
  { sigla: 'PB', nome: 'Paraíba', ddds: ['83'] },
  { sigla: 'PR', nome: 'Paraná', ddds: ['41', '42', '43', '44', '45', '46'] },
  { sigla: 'PE', nome: 'Pernambuco', ddds: ['81', '87'] },
  { sigla: 'PI', nome: 'Piauí', ddds: ['86', '89'] },
  { sigla: 'RJ', nome: 'Rio de Janeiro', ddds: ['21', '22', '24'] },
  { sigla: 'RN', nome: 'Rio Grande do Norte', ddds: ['84'] },
  { sigla: 'RS', nome: 'Rio Grande do Sul', ddds: ['51', '53', '54', '55'] },
  { sigla: 'RO', nome: 'Rondônia', ddds: ['69'] },
  { sigla: 'RR', nome: 'Roraima', ddds: ['95'] },
  { sigla: 'SC', nome: 'Santa Catarina', ddds: ['47', '48', '49'] },
  { sigla: 'SP', nome: 'São Paulo', ddds: ['11', '12', '13', '14', '15', '16', '17', '18', '19'] },
  { sigla: 'SE', nome: 'Sergipe', ddds: ['79'] },
  { sigla: 'TO', nome: 'Tocantins', ddds: ['63'] },
];

const extrairNumeroLocal = (valor: string, ddd = '') => {
  let numero = valor.replace(/\D/g, '');
  if (numero.startsWith('55')) numero = numero.slice(2);
  if (ddd && numero.startsWith(ddd)) numero = numero.slice(ddd.length);
  return numero.slice(0, 9);
};

const formatarTelefone = (valor: string, ddd = '') => {
  const numero = extrairNumeroLocal(valor, ddd);
  const formatado = numero.length > 8
    ? numero.slice(0, 5) + '-' + numero.slice(5)
    : numero.length > 4
      ? numero.slice(0, 4) + '-' + numero.slice(4)
      : numero;
  return ddd ? '+55 (' + ddd + ') ' + formatado : '+55 ' + formatado;
};

const maskDate = (val: string) => {
  let v = val.replace(/\D/g, "");
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length > 4) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
  if (v.length > 2) return `${v.slice(0, 2)}/${v.slice(2)}`;
  return v;
};

const formVazio = () => ({
  linhaSelect: '', linhaDigitada: '',
  estado: '', ddd: '',
  nome: "", telefone: "", email: "", cidade: "",
  tipoAparel: "Smartphone", 
  marcaSelect: "", marcaDigitada: "",
  modeloSelect: "", modeloDigitado: "",
  fotoEquipamento: "", defeito: "",
  servico: "", tecnico: "", statusOS: "Aguardando",
  dataEntrada: hoje(), dataRetirada: "", valor: "",
});

export function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteCompleto[]>(carregarClientes);
  const [busca, setBusca] = useState("");
  const [abrirModal, setAbrirModal] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => ({ ...formVazio(), telefone: '+55 ' }));
  const [erros, setErros] = useState<Record<string, string>>({});
  const fotoRef = useRef<HTMLInputElement>(null);
  const primeiraCarga = useRef(true);
  const ignorarProximoSalvamento = useRef(false);
  const [fotoProcessando, setFotoProcessando] = useState(false);
  const [marcaAberta, setMarcaAberta] = useState(false);
  const marcaMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    salvarClientesLocal(clientes);

    if (primeiraCarga.current) {
      primeiraCarga.current = false;
      if (existemClientesPendentes()) void salvarClientesPendentesFirebase();
      return;
    }

    if (ignorarProximoSalvamento.current) {
      ignorarProximoSalvamento.current = false;
      return;
    }

    void salvarClientesFirebase(clientes);
  }, [clientes]);

  useEffect(() => {
    const atualizarClientes = (event: Event) => {
      const detalhe = (event as CustomEvent<unknown>).detail;
      const clientesAtualizados = Array.isArray(detalhe)
        ? detalhe as ClienteCompleto[]
        : carregarClientes();
      setClientes((atuais) => {
        if (JSON.stringify(atuais) === JSON.stringify(clientesAtualizados)) return atuais;
        ignorarProximoSalvamento.current = true;
        return clientesAtualizados;
      });
    };
    window.addEventListener("sos-firebase-update", atualizarClientes);
    return () => window.removeEventListener("sos-firebase-update", atualizarClientes);
  }, []);

  useEffect(() => {
    let ativo = true;
    void iniciarSincronizacaoFirebase().then((clientesSincronizados) => {
      if (!ativo) return;
      const clientesAtualizados = Array.isArray(clientesSincronizados)
        ? clientesSincronizados as ClienteCompleto[]
        : carregarClientes();
      setClientes((atuais) => {
        if (JSON.stringify(atuais) === JSON.stringify(clientesAtualizados)) return atuais;
        ignorarProximoSalvamento.current = true;
        return clientesAtualizados;
      });
    });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!marcaAberta) return;
    const fecharAoClicarFora = (event: MouseEvent) => {
      if (!marcaMenuRef.current?.contains(event.target as Node)) {
        setMarcaAberta(false);
      }
    };
    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, [marcaAberta]);

  const set = (key: string, val: string) =>
    setForm((f) => ({
      ...f,
      [key]: key === 'telefone' ? formatarTelefone(val, f.ddd) : val,
    }));

  const filtrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      c.telefone.includes(busca)
  );

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_TAMANHO_FOTO_BYTES) {
      setErros({ foto: "A foto precisa ter no mÃ¡ximo 1 GB." });
      e.target.value = "";
      return;
    }
    setFotoProcessando(true);
    setErros({});
    try {
      const fotoLeve = await comprimirFoto(file);
      set("fotoEquipamento", fotoLeve);
    } catch {
      setErros({ foto: "Não foi possível processar esta foto. Tente escolher outra imagem." });
    } finally {
      setFotoProcessando(false);
      e.target.value = "";
    }
  };

  const selecionarMarca = (marca: string) => {
    set("marcaSelect", marca);
    set("marcaDigitada", "");
    set("linhaSelect", "");
    set("linhaDigitada", "");
    set("modeloSelect", "");
    set("modeloDigitado", "");
    setMarcaAberta(false);
  };

  const avancar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fotoProcessando) return;
    setErros({});
    setStep((s) => s + 1);
  };

  const handleSalvar = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (fotoProcessando) return;
    
    const marcaFinal = form.marcaSelect === "Outra" || !form.marcaSelect ? form.marcaDigitada : form.marcaSelect;
    const modeloFinal = form.modeloSelect === "Outro" || !form.modeloSelect ? form.modeloDigitado : form.modeloSelect;

    const novo: ClienteCompleto = {
      id: Date.now(),
      codigo: gerarCodigo(clientes),
      nome: form.nome.trim() || "Cliente Sem Nome",
      telefone: form.telefone.trim() || "Sem telefone",
      email: form.email.trim(),
      cidade: form.cidade.trim(),
      estado: form.estado,
      ddd: form.ddd,
      equipamentos: 1,
      status: "Ativo",
      os: {
        linha: linhaFinal.trim(),
        numero: gerarOS(clientes),
        tipoAparel: form.tipoAparel,
        marca: marcaFinal.trim() || "Não informada",
        modelo: modeloFinal.trim() || "Não informado",
        serial: "", // Removido IMEI
        fotoEquipamento: form.fotoEquipamento,
        // A tela usa fotoEquipamento como fallback; não duplicamos a imagem.
        fotoAntes: "",
        fotoDepois: "",
        defeito: form.defeito.trim() || "Não relatado",
        servico: form.servico.trim() || "Análise",
        tecnico: form.tecnico,
        statusOS: form.statusOS,
        dataEntrada: form.dataEntrada,
        dataRetirada: form.dataRetirada,
        publicToken: gerarTokenOS(),
        aprovacaoOrcamento: "pendente",
        assinaturaEntrega: "",
        assinaturaEm: "",
        valor: form.valor.trim() || "A orçar",
      },
    };
    marcarClienteLocalPendente(novo);
    const atualizado = [novo, ...clientes];
    salvarClientesLocal(atualizado);
    ignorarProximoSalvamento.current = true;
    setClientes(atualizado);
    void salvarClienteFirebase(novo);
    fechar();
  };

  const fechar = () => {
    setAbrirModal(false);
    setMarcaAberta(false);
    setStep(1);
    setForm({ ...formVazio(), telefone: '+55 ' });
    setErros({});
  };

  const inputCls = (campo?: string) =>
    `w-full rounded-lg border ${campo && erros[campo] ? "border-destructive" : "border-input"} bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring`;

  const steps = ["Cliente", "Equipamento", "Ordem de Serviço"];

  const marcasDisponiveis = MARCAS_POR_TIPO[form.tipoAparel] || ["Outra"];
  let modelosDisponiveis = ["Outro"];
  if (form.tipoAparel === "Smartphone") {
    if (form.marcaSelect === "Apple") modelosDisponiveis = MODELOS_APPLE;
    if (form.marcaSelect === "Samsung") modelosDisponiveis = MODELOS_SAMSUNG;
  }

  const marcaFinal = form.marcaSelect === "Outra" || !form.marcaSelect ? form.marcaDigitada : form.marcaSelect;
  const modeloFinal = form.modeloSelect === "Outro" || !form.modeloSelect ? form.modeloDigitado : form.modeloSelect;

  const catalogoAtual = CATALOGO_POR_TIPO[form.tipoAparel] || {};
  const marcaCatalogada = catalogoAtual[form.marcaSelect] || {};
  const usaCascata = form.tipoAparel !== 'Outro';
  const marcasDoFormulario = MARCAS_COMPLETAS_POR_TIPO[form.tipoAparel] || marcasDisponiveis;
  const linhasDisponiveis = Object.keys(marcaCatalogada).length > 0
    ? Object.keys(marcaCatalogada)
    : ['Outra'];
  const modelosDaLinha = form.linhaSelect
    ? (marcaCatalogada[form.linhaSelect] || [])
    : [];
  const modelosDoFormulario = usaCascata
    ? (form.linhaSelect ? [...modelosDaLinha, 'Outro'] : [])
    : modelosDisponiveis;
  const linhaFinal = form.linhaSelect === 'Outra' || !form.linhaSelect
    ? form.linhaDigitada
    : form.linhaSelect;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Clientes</h2>
            <p className="text-sm text-muted-foreground">Gerencie os clientes cadastrados na assistência.</p>
          </div>
          <button
            onClick={() => setAbrirModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Clientes cadastrados", val: clientes.length, cor: "bg-accent text-accent-foreground" },
            { label: "Clientes ativos", val: clientes.filter((c) => c.status === "Ativo").length, cor: "bg-success text-success-foreground" },
            { label: "Novos este mês", val: 9, cor: "bg-info text-info-foreground" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.cor}`}>
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.val}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, código ou telefone..."
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="p-4 space-y-3">
            {filtrados.map((c) => (
              <div
                key={c.id}
                className="group relative flex items-stretch gap-0 rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1"
              >
                <div className={`w-1.5 shrink-0 transition-colors ${c.status === 'Ativo' ? 'bg-emerald-500 group-hover:bg-emerald-400' : 'bg-muted-foreground/30'}`} />
                
                <div className="flex flex-1 flex-col lg:flex-row p-5 gap-6 lg:items-center">
                  
                  {/* Cliente Info */}
                  <div className="flex min-w-0 flex-1 items-center gap-4 lg:min-w-[240px]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shadow-inner">
                      {c.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-base group-hover:text-primary transition-colors">{c.nome}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span 
                          className="rounded-md bg-muted px-3 py-1 text-sm font-bold text-foreground font-mono select-all cursor-copy border border-border shadow-sm transition-colors hover:border-primary/50 hover:text-primary"
                          title="Clique duas vezes ou arraste para copiar"
                        >
                          {c.codigo}
                        </span>
                        {c.cidade && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            {c.cidade}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="flex min-w-0 flex-col gap-2 lg:min-w-[160px] lg:border-l lg:border-border/50 lg:pl-6">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{c.telefone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {c.email ? (
                        <span className="truncate max-w-[180px]">{c.email}</span>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Sem e-mail</span>
                      )}
                    </div>
                  </div>

                  {/* Equipamento */}
                  <div className="min-w-0 flex-1 lg:min-w-[220px] lg:border-l lg:border-border/50 lg:pl-6">
                    {c.os ? (
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                           {c.os.fotoEquipamento ? (
                             <img src={c.os.fotoEquipamento} loading="lazy" decoding="async" className="h-12 w-12 rounded-xl object-cover shadow-sm ring-1 ring-border group-hover:ring-primary/50 transition-all" />
                           ) : (
                             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted ring-1 ring-border group-hover:ring-primary/50 transition-all">
                               <Wrench className="h-5 w-5 text-muted-foreground" />
                             </div>
                           )}
                           <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background ring-1 ring-border shadow-sm text-primary">
                             <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                           </div>
                        </div>
                        <div className="flex min-w-0 flex-col justify-center">
                          <div className="mb-1 flex items-center gap-2">
                            <MarcaLogo marca={c.os.marca} tamanho="sm" />
                            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{c.os.marca}</span>
                          </div>
                          <p className="font-bold text-sm text-foreground leading-tight">{c.os.marca} {c.os.modelo}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mt-0.5">{c.os.tipoAparel}</p>
                          {c.os.defeito && <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">{c.os.defeito}</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center gap-2 text-muted-foreground">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 border border-border border-dashed">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                        </div>
                        <span className="text-sm font-medium">{c.equipamentos} {c.equipamentos === 1 ? 'Aparelho' : 'Aparelhos'}</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex min-w-0 flex-col items-start gap-2 border-t border-border/50 pt-4 lg:mt-0 lg:min-w-[160px] lg:items-end lg:border-l lg:border-t-0 lg:border-border/50 lg:pl-6 lg:pt-0">
                    {c.os ? (
                      <>
                        <div className="flex items-center justify-between w-full lg:w-auto lg:justify-end gap-3 mb-1">
                          {c.os.valor && (
                            <span className="text-sm font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              {(() => {
                                const valStr = String(c.os.valor);
                                if (valStr.toLowerCase().includes('orçar') || valStr.toLowerCase().includes('combinar')) return valStr;
                                const apenasNumeros = valStr.replace(/[^\d.,]/g, '').replace(',', '.');
                                const num = parseFloat(apenasNumeros);
                                return isNaN(num) ? valStr : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
                              })()}
                            </span>
                          )}
                          <StatusBadge status={c.os.statusOS} />
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-1 w-full lg:w-auto text-left lg:text-right">
                          <p className="text-[10px] font-medium text-muted-foreground tracking-wide">
                            Entrada: <span className="text-foreground">{c.os.dataEntrada}</span>
                          </p>
                          {c.os.dataRetirada && (
                            <p className="text-[10px] font-medium text-muted-foreground tracking-wide">
                              Retirada: <span className="text-foreground">{c.os.dataRetirada}</span>
                            </p>
                          )}
                          {c.os.tecnico && (
                            <p className="text-[10px] font-medium text-muted-foreground tracking-wide">
                              Técnico: <span className="text-foreground">{c.os.tecnico}</span>
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center">
                        <StatusBadge status={c.status} />
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
            
            {filtrados.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border bg-card/50">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-base font-semibold text-foreground">Nenhum cliente encontrado.</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Não localizamos nenhum registro correspondente a "{busca}". Tente buscar por outro termo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal 3 passos ── */}
      {abrirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={fechar} />

          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[92vh]">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-foreground">Novo Cliente + OS</h3>
                <p className="text-xs text-muted-foreground">
                  Passo {step} de {steps.length}: <span className="font-semibold text-primary">{steps[step - 1]}</span>
                </p>
              </div>
              <button onClick={fechar} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Indicador de steps */}
            <div className="flex items-center px-6 pt-4 pb-2 shrink-0">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    i + 1 < step ? "bg-emerald-500 text-white" :
                    i + 1 === step ? "bg-primary text-white shadow-md shadow-primary/30" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1 < step ? "✓" : i + 1}
                  </div>
                  <span className={`ml-1.5 text-xs font-medium hidden sm:inline ${i + 1 === step ? "text-foreground" : "text-muted-foreground"}`}>
                    {s}
                  </span>
                  {i < steps.length - 1 && (
                    <div className={`mx-2 flex-1 h-0.5 rounded transition-all ${i + 1 < step ? "bg-emerald-400" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Conteúdo */}
            <form onSubmit={handleSalvar} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

                {/* PASSO 1 — Cliente */}
                {step === 1 && (
                  <>
                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                      <div>
                        <label className='mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                          Estado
                        </label>
                        <select
                          value={form.estado}
                          onChange={(e) => {
                            const selecionado = ESTADOS_BR.find((estado) => estado.sigla === e.target.value);
                            const numero = extrairNumeroLocal(form.telefone, form.ddd);
                            const ddd = selecionado?.ddds[0] ?? '';
                            setForm((atual) => ({
                              ...atual,
                              estado: e.target.value,
                              ddd,
                              telefone: formatarTelefone(numero, ddd),
                            }));
                          }}
                          className={inputCls()}
                        >
                          <option value=''>Selecione o estado</option>
                          {ESTADOS_BR.map((estado) => (
                            <option key={estado.sigla} value={estado.sigla}>
                              {estado.sigla} - {estado.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className='mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                          DDD
                        </label>
                        <select
                          value={form.ddd}
                          disabled={!form.estado}
                          onChange={(e) => setForm((atual) => ({
                            ...atual,
                            ddd: e.target.value,
                            telefone: formatarTelefone(
                              extrairNumeroLocal(atual.telefone, atual.ddd),
                              e.target.value,
                            ),
                          }))}
                          className={inputCls()}
                        >
                          <option value=''>Escolha o estado primeiro</option>
                          {(ESTADOS_BR.find((estado) => estado.sigla === form.estado)?.ddds ?? []).map((ddd) => (
                            <option key={ddd} value={ddd}>{ddd}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Dados do Cliente</span>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Nome completo <span className="text-destructive">*</span>
                      </label>
                      <input type="text" value={form.nome} onChange={(e) => set("nome", e.target.value)}
                        placeholder="Digite o nome do cliente" className={inputCls("nome")} autoFocus />
                      {erros.nome && <p className="mt-1 text-xs text-destructive">{erros.nome}</p>}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Telefone <span className="text-destructive">*</span>
                        </label>
                        <input type="tel" value={form.telefone} onChange={(e) => set("telefone", e.target.value)}
                          placeholder="Digite o número" className={inputCls("telefone")} />
                        {erros.telefone && <p className="mt-1 text-xs text-destructive">{erros.telefone}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">E-mail</label>
                        <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                          placeholder="Digite o email (opcional)" className={inputCls()} />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cidade</label>
                      <input type="text" value={form.cidade} onChange={(e) => set("cidade", e.target.value)}
                        placeholder="Digite a cidade (opcional)" className={inputCls()} />
                    </div>
                  </>
                )}

                {/* PASSO 2 — Equipamento */}
                {step === 2 && (
                  <>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Dados do Equipamento</span>
                    </div>

                    {/* Foto */}
                    <div className="flex flex-col items-center gap-2">
                      <div
                        onClick={() => fotoRef.current?.click()}
                        className="relative flex h-32 w-full max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-input bg-muted hover:border-primary hover:bg-accent transition-colors"
                      >
                        {form.fotoEquipamento ? (
                          <img src={form.fotoEquipamento} alt="Equipamento" className="h-full w-full object-contain p-2" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Camera className="h-8 w-8" />
                            <span className="text-xs font-medium">Clique para adicionar foto do aparelho</span>
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => fotoRef.current?.click()}
                        disabled={fotoProcessando}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                        <Upload className="h-3.5 w-3.5" />
                        {fotoProcessando ? "Processando foto..." : form.fotoEquipamento ? "Trocar foto" : "Escolher da galeria / explorador"}
                      </button>
                      <input ref={fotoRef} type="file" accept="image/*,.jpn,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.heif,.webm" className="hidden" onChange={handleFoto} />
                      {erros.foto && <p className="text-center text-xs text-destructive">{erros.foto}</p>}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo de aparelho</label>
                      <select 
                        value={form.tipoAparel} 
                        onChange={(e) => {
                          set("tipoAparel", e.target.value);
                          set("marcaSelect", "");
                          set("linhaSelect", "");
                          set("linhaDigitada", "");
                          set("modeloSelect", "");
                          set("modeloDigitado", "");
                        }} 
                        className={inputCls()}
                      >
                        {TIPOS.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Marca</label>
                        <div ref={marcaMenuRef} className="relative">
                          <button
                            type="button"
                            aria-haspopup="listbox"
                            aria-expanded={marcaAberta}
                            onClick={() => setMarcaAberta((aberta) => !aberta)}
                            className={inputCls() + " flex items-center justify-between gap-2 text-left"}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              {form.marcaSelect ? (
                                <MarcaLogo marca={form.marcaSelect} tamanho="sm" />
                              ) : (
                                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">?</span>
                              )}
                              <span className="truncate">{form.marcaSelect || "Selecione..."}</span>
                            </span>
                            <ChevronDown className={"h-4 w-4 shrink-0 text-muted-foreground transition-transform " + (marcaAberta ? "rotate-180" : "")} />
                          </button>

                          {marcaAberta && (
                            <div
                              role="listbox"
                              className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-72 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-xl"
                            >
                              <button
                                type="button"
                                role="option"
                                aria-selected={!form.marcaSelect}
                                onClick={() => selecionarMarca("")}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
                              >
                                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">?</span>
                                <span>Selecione...</span>
                              </button>
                              {marcasDoFormulario.map((marca) => (
                                <button
                                  key={marca}
                                  type="button"
                                  role="option"
                                  aria-selected={form.marcaSelect === marca}
                                  onClick={() => selecionarMarca(marca)}
                                  className={"flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10 " + (form.marcaSelect === marca ? "bg-primary/10 font-semibold text-primary" : "text-foreground")}
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    <MarcaLogo marca={marca} tamanho="sm" />
                                    <span className="truncate">{marca}</span>
                                  </span>
                                  {form.marcaSelect === marca && <Check className="h-4 w-4 shrink-0 text-primary" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {form.marcaSelect === "Outra" && (
                          <input
                            type="text"
                            value={form.marcaDigitada}
                            onChange={(e) => set("marcaDigitada", e.target.value)}
                            placeholder="Digite a marca..."
                            className={inputCls()}
                            autoFocus
                          />
                        )}
                      </div>

                      {usaCascata && (
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Linha / família</label>
                          <select
                            value={form.linhaSelect}
                            onChange={(e) => {
                              set("linhaSelect", e.target.value);
                              set("modeloSelect", "");
                              set("modeloDigitado", "");
                            }}
                            disabled={!form.marcaSelect}
                            className={inputCls() + " disabled:cursor-not-allowed disabled:opacity-60"}
                          >
                            <option value="" disabled>{form.marcaSelect ? "Selecione..." : "Selecione a marca primeiro"}</option>
                            {linhasDisponiveis.map((linha) => <option key={linha}>{linha}</option>)}
                          </select>
                          {form.linhaSelect === "Outra" && (
                            <input
                              type="text"
                              value={form.linhaDigitada}
                              onChange={(e) => set("linhaDigitada", e.target.value)}
                              placeholder="Digite a linha / família..."
                              className={inputCls()}
                              autoFocus
                            />
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Modelo</label>
                        <select
                          value={form.modeloSelect}
                          onChange={(e) => set("modeloSelect", e.target.value)}
                          disabled={usaCascata && !form.linhaSelect}
                          className={inputCls() + " disabled:cursor-not-allowed disabled:opacity-60"}
                        >
                          <option value="" disabled>
                            {usaCascata && !form.linhaSelect ? "Selecione a linha primeiro" : "Selecione..."}
                          </option>
                          {modelosDoFormulario.map((modelo) => <option key={modelo}>{modelo}</option>)}
                        </select>
                        {form.modeloSelect === "Outro" && (
                          <input
                            type="text"
                            value={form.modeloDigitado}
                            onChange={(e) => set("modeloDigitado", e.target.value)}
                            placeholder="Digite o modelo..."
                            className={inputCls()}
                            autoFocus
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Defeito relatado</label>
                      <textarea value={form.defeito} onChange={(e) => set("defeito", e.target.value)}
                        rows={3} placeholder="Descreva o problema relatado pelo cliente..."
                        className={`${inputCls()} resize-none`} />
                    </div>
                  </>
                )}

                {/* PASSO 3 — Ordem de Serviço */}
                {step === 3 && (
                  <>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Ordem de Serviço</span>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Serviço a realizar</label>
                      <input type="text" value={form.servico} onChange={(e) => set("servico", e.target.value)}
                        placeholder="Ex.: Troca de tela, limpeza interna..." className={inputCls()} autoFocus />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status da OS</label>
                        <select value={form.statusOS} onChange={(e) => set("statusOS", e.target.value)} className={inputCls()}>
                          {STATUS_OS.map((s) => <option key={s}>{s}</option>)}
                          <option>Pronto</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Técnico responsável</label>
                        <input type="text" value={form.tecnico} onChange={(e) => set("tecnico", e.target.value)}
                          placeholder="Digite o nome do técnico" className={inputCls()} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <CalendarDays className="h-3 w-3" /> Data de entrada
                        </label>
                        <input type="text" value={form.dataEntrada} onChange={(e) => set("dataEntrada", maskDate(e.target.value))}
                          placeholder="DD/MM/AAAA" className={inputCls()} />
                      </div>
                      <div>
                        <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <CalendarDays className="h-3 w-3" /> Previsão de retirada
                        </label>
                        <input type="text" value={form.dataRetirada} onChange={(e) => set("dataRetirada", maskDate(e.target.value))}
                          placeholder="DD/MM/AAAA" className={inputCls()} />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <DollarSign className="h-3 w-3" /> Valor do serviço
                      </label>
                      <input type="text" value={form.valor} onChange={(e) => set("valor", e.target.value)}
                        placeholder="Ex.: R$ 250,00" className={inputCls()} />
                    </div>

                    {/* Resumo */}
                    <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">📋 Resumo da entrada</p>
                      <div className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
                        {[
                          ["Cliente", form.nome],
                          ["Telefone", form.telefone],
                          ["Aparelho", `${marcaFinal} ${modeloFinal}`.trim() || "—"],
                          ["Linha", linhaFinal || "—"],
                          ["Tipo", form.tipoAparel],
                          ["Defeito", form.defeito || "—"],
                          ["Técnico", form.tecnico],
                          ["Entrada", form.dataEntrada],
                          ["Retirada", form.dataRetirada || "—"],
                          ["Status", form.statusOS],
                          ["Valor", form.valor || "—"],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <span className="text-muted-foreground">{k}: </span>
                            <span className="font-medium text-foreground">{v}</span>
                          </div>
                        ))}
                      </div>
                      {form.fotoEquipamento && (
                        <img src={form.fotoEquipamento} alt="Equipamento"
                          className="mt-2 h-24 w-full object-contain rounded-lg bg-background border border-border" />
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Botões de navegação */}
              <div className="flex items-center justify-between border-t border-border px-6 py-4 shrink-0">
                <button
                  type="button"
                  onClick={step === 1 ? fechar : () => { setErros({}); setStep((s) => s - 1); }}
                  className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {step === 1 ? "Cancelar" : "← Voltar"}
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={avancar}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Próximo →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Cadastrar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
