import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useInvoice, useInvoicePDF } from "@/hooks/use-invoices";
import { Button, Card } from "@/components/ui/shared";
import { Download, ArrowLeft, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function InvoiceView() {
  const { id } = useParams();
  const invoiceId = parseInt(id || "0");
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const pdfQuery = useInvoicePDF(invoiceId);

  const handleDownloadPdf = async () => {
    const { data } = await pdfQuery.refetch();
    if (data?.pdf) {
      const linkSource = `data:application/pdf;base64,${data.pdf}`;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = `${invoice?.number || 'invoice'}.pdf`;
      downloadLink.click();
    }
  };

  if (isLoading) return <Layout><div className="p-8 text-foreground">Loading invoice data...</div></Layout>;
  if (!invoice) return <Layout><div className="p-8 text-destructive">Invoice not found</div></Layout>;

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/invoices" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Invoices
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-display font-bold text-foreground">{invoice.number}</h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-semibold border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" /> DIAN Validated
          </span>
        </div>
        <Button onClick={handleDownloadPdf} disabled={pdfQuery.isFetching} className="gap-2 bg-white text-black hover:bg-gray-100 shadow-white/20">
          <Download className="w-4 h-4" /> {pdfQuery.isFetching ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Billed To</h3>
                <p className="font-bold text-lg text-foreground">{invoice.customer.name}</p>
                <p className="text-muted-foreground mt-1">NIT: {invoice.customer.nit}-{invoice.customer.dv}</p>
                <p className="text-muted-foreground">{invoice.customer.address}</p>
                <p className="text-muted-foreground">{invoice.customer.email}</p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Invoice Details</h3>
                <p className="text-foreground"><span className="text-muted-foreground">Date:</span> {format(new Date(invoice.date), 'MMM dd, yyyy')}</p>
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-border text-sm font-bold text-foreground">
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Price</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {invoice.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-4 font-medium">{item.product.name}</td>
                    <td className="py-4 text-center">{item.quantity}</td>
                    <td className="py-4 text-right">${item.price.toLocaleString()}</td>
                    <td className="py-4 text-right font-semibold">${(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-6">
              <div className="w-64 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">${invoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA</span>
                  <span className="text-foreground font-medium">${invoice.iva.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <span className="text-lg font-bold text-emerald-400">${invoice.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-accent/20 border-primary/10">
            <h3 className="font-display font-bold text-lg mb-4">DIAN Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">CUFE</p>
                <p className="text-xs font-mono text-foreground break-all bg-background p-3 rounded-lg border border-border">{invoice.cufe}</p>
              </div>
              <Button variant="outline" className="w-full text-xs h-9">Download XML</Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
