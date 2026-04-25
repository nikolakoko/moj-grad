import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { User } from "@/types";
import type { UserRole } from "@/types";

interface JwtPayload {
  sub: string;
  id: string;
  role: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend prakja "ROLE_ADMIN" ili "ROLE_ADMINISTRATION_WORKER"
// Frontend ocekuva "ADMIN" ili "ADMINISTRATION_WORKER"
function stripRolePrefix(role: string): UserRole {
  return role.replace("ROLE_", "") as UserRole;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);

        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser({
            id: String(decoded.id),
            email: decoded.sub,
            role: stripRolePrefix(decoded.role),
            name: decoded.sub,
            enabled: true,
          });
        }
      } catch (err) {
        console.error("Invalid token");
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      const { token } = data;

      if (!token) return false;

      localStorage.setItem("token", token);

      const decoded = jwtDecode<JwtPayload>(token);

      setUser({
        id: String(decoded.id),
        email: decoded.sub,
        role: stripRolePrefix(decoded.role),
        name: decoded.sub,
        enabled: true,
      });

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}