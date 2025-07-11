import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const token = localStorage.getItem('authToken');
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: !!token,
  });

  const logout = () => {
    localStorage.removeItem('authToken');
    window.location.reload();
  };

  // If there's an error and we have a token, it's likely invalid
  if (error && token) {
    localStorage.removeItem('authToken');
  }

  return {
    user: user as User | undefined,
    isLoading: isLoading && !!token,
    isAuthenticated: !!token && !!user,
    logout,
  };
}