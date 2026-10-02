import { useContext } from "react";
import { AuthContext } from "@/contexts/auth-context";

/** const { user, login, logout, can } = useAuth(); */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
  return context;
}
