import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { fetchWithAuth, parseWithLogging } from "@/lib/fetch-with-auth";
import { z } from "zod";

type CustomerInput = z.infer<typeof api.customers.create.input>;

export function useCustomers() {
  return useQuery({
    queryKey: [api.customers.list.path],
    queryFn: async () => {
      const res = await fetchWithAuth(api.customers.list.path);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      return parseWithLogging(api.customers.list.responses[200], data, "customers.list");
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customer: CustomerInput) => {
      const validated = api.customers.create.input.parse(customer);
      const res = await fetchWithAuth(api.customers.create.path, {
        method: api.customers.create.method,
        body: JSON.stringify(validated),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create customer");
      return parseWithLogging(api.customers.create.responses[201], data, "customers.create");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.customers.list.path] }),
  });
}
