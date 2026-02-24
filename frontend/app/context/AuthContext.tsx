import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  login: (payload: { name: string; email: string }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  const login: AuthContextType["login"] = (payload) => {
    setUser(payload);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  const value = useMemo(() => ({ isLoggedIn, user, login, logout }), [isLoggedIn, user]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
