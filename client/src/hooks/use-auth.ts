import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { fetchWithAuth, parseWithLogging } from "@/lib/fetch-with-auth";
import { z } from "zod";

type LoginInput = z.infer<typeof api.auth.login.input>;
type RegisterInput = z.infer<typeof api.auth.register.input>;

export function useUser() {
  return useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      if (!localStorage.getItem('jwt_token')) return null;
      const res = await fetchWithAuth(api.auth.me.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      return parseWithLogging(api.auth.me.responses[200], data, "auth.me");
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const validated = api.auth.login.input.parse(credentials);
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 400 || res.status === 401) {
          throw new Error(data.message || "Invalid credentials");
        }
        throw new Error("Failed to login");
      }
      
      const parsed = parseWithLogging(api.auth.login.responses[200], data, "auth.login");
      localStorage.setItem('jwt_token', parsed.token);
      return parsed.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: RegisterInput) => {
      const validated = api.auth.register.input.parse(credentials);
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 400) throw new Error(data.message || "Validation failed");
        throw new Error("Failed to register");
      }
      
      const parsed = parseWithLogging(api.auth.register.responses[201], data, "auth.register");
      localStorage.setItem('jwt_token', parsed.token);
      return parsed.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    localStorage.removeItem('jwt_token');
    queryClient.setQueryData([api.auth.me.path], null);
    queryClient.clear();
  };
}
