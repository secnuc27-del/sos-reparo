import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter, createHashHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { LoginPage } from "./components/LoginPage";
import { ThemeProvider } from "./components/ThemeProvider";
import { iniciarSincronizacaoFirebase } from "./lib/firebaseSync";
import "./styles.css";

const hashHistory = createHashHistory();

const router = createRouter({
  routeTree,
  history: hashHistory,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const { isAuthenticated } = useAuth();
  const isPublicTracking = window.location.hash.startsWith("#/acompanhar/");

  useEffect(() => {
    if (isAuthenticated && !isPublicTracking) {
      void iniciarSincronizacaoFirebase();
    }
  }, [isAuthenticated, isPublicTracking]);

  if (!isAuthenticated && !isPublicTracking) {
    return <LoginPage />;
  }

  return <RouterProvider router={router} />;
}

const root = document.getElementById("root")!;
createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
