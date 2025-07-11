import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const token = localStorage.getItem('authToken');
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: !!token,
  });

  const logout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!token && !!user,
    logout,
  };
}