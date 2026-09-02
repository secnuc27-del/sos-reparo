import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Wrench,
  Users,
  MonitorSmartphone,
  ClipboardList,
  Search,
  Bell,
  CircleUser,
  LogOut,
  History,
  LayoutDashboard,
  CheckCircle2,
  Menu,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import { logoUrl } from "@/lib/logo";
import type { FirebaseStatus } from "@/lib/firebaseSync";

const navItems = [
  { to: "/", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/equipamentos", label: "Equipamentos", icon: MonitorSmartphone },
  { to: "/ordens-servico", label: "Ordens de Serviço", icon: ClipboardList },
  { to: "/prontos", label: "Prontos", icon: CheckCircle2 },
  { to: "/consulta", label: "Consulta de OS", icon: Search },
  { to: "/historico", label: "Histórico", icon: History },
] as const;

export function Layout({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = navItems.find((i) => 
    i.to === "/" ? pathname === "/" : pathname.startsWith(i.to)
  );
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuAberto, setMenuAberto] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseStatus>("conectando");

  useEffect(() => {
    const atualizarStatus = (event: Event) => {
      const status = (event as CustomEvent<FirebaseStatus>).detail;
      if (status === "conectando" || status === "conectado" || status === "offline") {
        setFirebaseStatus(status);
      }
    };
    window.addEventListener("sos-firebase-status", atualizarStatus);
    return () => window.removeEventListener("sos-firebase-status", atualizarStatus);
  }, []);

  const statusFirebase = {
    conectando: { label: "Conectando…", className: "text-amber-600", Icon: Wifi },
    conectado: { label: "Sincronizado", className: "text-emerald-600", Icon: Wifi },
    offline: { label: "Offline", className: "text-red-600", Icon: WifiOff },
  }[firebaseStatus];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      {menuAberto && <button aria-label="Fechar menu" onClick={() => setMenuAberto(false)} className="fixed inset-0 z-20 bg-slate-950/45 lg:hidden" />}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-sidebar-border bg-sidebar shadow-2xl lg:shadow-none ${menuAberto ? "flex" : "hidden"} lg:flex`}>
        <div className="border-b border-sidebar-border px-4 py-5 flex justify-center overflow-hidden h-24 items-center">
          <div className="rounded-2xl bg-transparent px-1 py-1 dark:bg-white">
            <img 
              src={logoUrl} 
              alt="SOS Reparo Logo" 
              className="w-[210px] max-w-none h-auto drop-shadow-sm mix-blend-multiply dark:mix-blend-normal" 
              style={{ clipPath: "inset(0% 0 20% 0)", transform: "scale(1.05) translateY(6px)" }}
            />
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <item.icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg px-2 py-1">
            <CircleUser className="h-7 w-7 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">Técnico</p>
              <p className="truncate text-xs text-muted-foreground">admin@sosreparo.com</p>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>


      {/* Main */}
      <div className="ml-0 flex min-h-screen min-w-0 flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button onClick={() => setMenuAberto(true)} aria-label="Abrir menu" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
              {current?.label ?? "SOS Reparo"}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span
              className={`flex items-center gap-1.5 text-xs font-semibold ${statusFirebase.className}`}
              title={`Firebase: ${statusFirebase.label}`}
            >
              <statusFirebase.Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{statusFirebase.label}</span>
            </span>
            <label
              className="theme-switch"
              title={theme === "dark" ? "Ativar modo claro" : "Ativar modo noite"}
            >
              <input
                type="checkbox"
                checked={theme === "light"}
                onChange={toggleTheme}
                aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo noite"}
              />
              <span className="theme-slider">
                <span className="moons-hole" aria-hidden="true">
                  <span className="moon-hole" />
                  <span className="moon-hole" />
                  <span className="moon-hole" />
                </span>
                <span className="stars" aria-hidden="true">
                  {[20, 15, 10, 12, 8].map((size, index) => (
                    <svg key={index} className="star" viewBox="0 0 24 24" style={{ width: size }}>
                      <path d="m12 2 2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4L12 2Z" />
                    </svg>
                  ))}
                </span>
                <span className="clouds" aria-hidden="true">
                  {Array.from({ length: 7 }, (_, index) => <span key={index} className="cloud" />)}
                </span>
                <span className="black-clouds" aria-hidden="true">
                  {Array.from({ length: 3 }, (_, index) => <span key={index} className="black-cloud" />)}
                </span>
              </span>
            </label>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
