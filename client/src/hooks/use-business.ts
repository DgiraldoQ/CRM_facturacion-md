import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { fetchWithAuth, parseWithLogging } from "@/lib/fetch-with-auth";
import { z } from "zod";

type BusinessInput = z.infer<typeof api.business.create.input>;

export function useBusiness() {
  return useQuery({
    queryKey: [api.business.get.path],
    queryFn: async () => {
      const res = await fetchWithAuth(api.business.get.path);
      if (!res.ok) throw new Error("Failed to fetch business details");
      const data = await res.json();
      return parseWithLogging(api.business.get.responses[200], data, "business.get");
    },
  });
}

export function useRegisterBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (businessData: BusinessInput) => {
      const validated = api.business.create.input.parse(businessData);
      const res = await fetchWithAuth(api.business.create.path, {
        method: api.business.create.method,
        body: JSON.stringify(validated),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register business");
      
      return parseWithLogging(api.business.create.responses[201], data, "business.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.business.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] }); // Refresh user to get businessId
    },
  });
}
