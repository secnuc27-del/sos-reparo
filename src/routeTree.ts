import {
  createRootRoute,
  createRoute,
  redirect,
} from "@tanstack/react-router";

import { RootLayout } from "./routes/__root";
import { ClientesPage } from "./routes/clientes";
import { EquipamentosPage } from "./routes/equipamentos";
import { OrdensPage } from "./routes/ordens-servico";
import { ProntosPage } from "./routes/prontos";
import { ConsultaPage } from "./routes/consulta";
import { HistoricoPage } from "./routes/historico";
import { DashboardPage } from "./routes/dashboard";
import { AcompanharPage } from "./routes/acompanhar";
import { AssistentePage } from "./routes/assistente";

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => {
    if (typeof window !== "undefined") {
      window.location.hash = "#/";
    }
    return null;
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const clientesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clientes",
  component: ClientesPage,
});

const equipamentosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/equipamentos",
  component: EquipamentosPage,
});

const ordensRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ordens-servico",
  component: OrdensPage,
});

const prontosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prontos",
  component: ProntosPage,
});

const consultaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/consulta",
  component: ConsultaPage,
});

const historicoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/historico",
  component: HistoricoPage,
});

const acompanharRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/acompanhar/$token",
  component: AcompanharPage,
});

const assistenteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assistente",
  component: AssistentePage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  clientesRoute,
  equipamentosRoute,
  ordensRoute,
  prontosRoute,
  consultaRoute,
  historicoRoute,
  acompanharRoute,
  assistenteRoute,
]);

