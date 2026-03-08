import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { fetchWithAuth, parseWithLogging } from "@/lib/fetch-with-auth";
import { z } from "zod";

type InvoiceInput = z.infer<typeof api.invoices.create.input>;

export function useInvoices() {
  return useQuery({
    queryKey: [api.invoices.list.path],
    queryFn: async () => {
      const res = await fetchWithAuth(api.invoices.list.path);
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const data = await res.json();
      return parseWithLogging(api.invoices.list.responses[200], data, "invoices.list");
    },
  });
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: [api.invoices.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.invoices.get.path, { id });
      const res = await fetchWithAuth(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch invoice");
      const data = await res.json();
      return parseWithLogging(api.invoices.get.responses[200], data, "invoices.get");
    },
    enabled: !!id,
  });
}

export function useInvoicePDF(id: number) {
  return useQuery({
    queryKey: [api.invoices.pdf.path, id],
    queryFn: async () => {
      const url = buildUrl(api.invoices.pdf.path, { id });
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error("Failed to generate PDF");
      const data = await res.json();
      return parseWithLogging(api.invoices.pdf.responses[200], data, "invoices.pdf");
    },
    enabled: false, // Triggered manually
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceData: InvoiceInput) => {
      const validated = api.invoices.create.input.parse(invoiceData);
      const res = await fetchWithAuth(api.invoices.create.path, {
        method: api.invoices.create.method,
        body: JSON.stringify(validated),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create invoice");
      return parseWithLogging(api.invoices.create.responses[201], data, "invoices.create");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.invoices.list.path] }),
  });
}
