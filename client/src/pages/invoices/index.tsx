import { Layout } from "@/components/layout";
import { useInvoices } from "@/hooks/use-invoices";
import { Button, Card } from "@/components/ui/shared";
import { Plus, FileText, Download } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function InvoicesList() {
  const { data: invoices, isLoading } = useInvoices();

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-2">View and manage issued DIAN invoices.</p>
        </div>
        <Link href="/invoices/new" className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 h-11 px-6 gap-2">
          <Plus className="w-4 h-4" /> Create Invoice
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-card/50 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="p-5">Number</th>
                <th className="p-5">Date</th>
                <th className="p-5">CUFE</th>
                <th className="p-5">Total</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>}
              {invoices?.map(invoice => (
                <tr key={invoice.id} className="hover:bg-accent/30 transition-colors">
                  <td className="p-5 font-bold text-foreground">{invoice.number}</td>
                  <td className="p-5 text-muted-foreground">{format(new Date(invoice.date), 'MMM dd, yyyy')}</td>
                  <td className="p-5">
                    <span className="font-mono text-xs text-muted-foreground bg-background px-2 py-1 rounded border border-border truncate block max-w-[200px]" title={invoice.cufe}>
                      {invoice.cufe}
                    </span>
                  </td>
                  <td className="p-5 font-semibold text-emerald-400">${invoice.total.toLocaleString()}</td>
                  <td className="p-5 flex justify-end gap-2">
                    <Link href={`/invoices/${invoice.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                      <FileText className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {invoices?.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">No invoices created yet</h3>
                      <p className="text-muted-foreground mb-6">Create your first electronic invoice to start billing your customers.</p>
                      <Link href="/invoices/new" className="text-primary font-medium hover:underline">Create Invoice →</Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
}
