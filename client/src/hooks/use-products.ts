import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { fetchWithAuth, parseWithLogging } from "@/lib/fetch-with-auth";
import { z } from "zod";

type ProductInput = z.infer<typeof api.products.create.input>;
type ProductUpdateInput = z.infer<typeof api.products.update.input>;

export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetchWithAuth(api.products.list.path);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      return parseWithLogging(api.products.list.responses[200], data, "products.list");
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: ProductInput) => {
      const validated = api.products.create.input.parse(product);
      const res = await fetchWithAuth(api.products.create.path, {
        method: api.products.create.method,
        body: JSON.stringify(validated),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create product");
      return parseWithLogging(api.products.create.responses[201], data, "products.create");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.products.list.path] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & ProductUpdateInput) => {
      const validated = api.products.update.input.parse(updates);
      const url = buildUrl(api.products.update.path, { id });
      const res = await fetchWithAuth(url, {
        method: api.products.update.method,
        body: JSON.stringify(validated),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update product");
      return parseWithLogging(api.products.update.responses[200], data, "products.update");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.products.list.path] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.products.delete.path, { id });
      const res = await fetchWithAuth(url, { method: api.products.delete.method });
      if (!res.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.products.list.path] }),
  });
}
