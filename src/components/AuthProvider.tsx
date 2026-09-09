import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "dono" | "funcionario";

type AuthContextType = {
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (role: UserRole, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const SENHA_DONO = "admin123";
const SENHA_FUNC = "func123";
const AUTH_KEY = "techfix_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem(AUTH_KEY) as UserRole) || null;
  });

  const isAuthenticated = role !== null;

  const login = (selectedRole: UserRole, password: string): boolean => {
    if (selectedRole === "dono" && password === SENHA_DONO) {
      localStorage.setItem(AUTH_KEY, "dono");
      setRole("dono");
      return true;
    }
    if (selectedRole === "funcionario" && password === SENHA_FUNC) {
      localStorage.setItem(AUTH_KEY, "funcionario");
      setRole("funcionario");
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
