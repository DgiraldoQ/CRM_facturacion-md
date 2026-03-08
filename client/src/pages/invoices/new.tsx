import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { useCreateInvoice } from "@/hooks/use-invoices";
import { Button, Input, Label, Card } from "@/components/ui/shared";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Receipt } from "lucide-react";

export default function NewInvoice() {
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();
  const createInvoice = useCreateInvoice();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<{ productId: string, quantity: number, price: number }[]>([]);

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products?.find(p => p.id.toString() === productId);
    const newItems = [...items];
    newItems[index].productId = productId;
    if (product) {
      newItems[index].price = product.price;
    }
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const newItems = [...items];
    newItems[index].quantity = qty;
    setItems(newItems);
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const iva = subtotal * 0.19; // Simplified standard 19% IVA for demo
  const total = subtotal + iva;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return toast({ title: "Error", description: "Select a customer", variant: "destructive" });
    if (items.length === 0 || items.some(i => !i.productId)) return toast({ title: "Error", description: "Add valid products", variant: "destructive" });

    createInvoice.mutate({
      customerId: parseInt(customerId),
      items: items.map(i => ({
        productId: parseInt(i.productId),
        quantity: i.quantity,
        price: i.price
      }))
    }, {
      onSuccess: () => setLocation("/invoices"),
      onError: (err) => toast({ title: "Failed to generate", description: err.message, variant: "destructive" })
    });
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-foreground">New Invoice</h1>
        <p className="text-muted-foreground mt-2">Generate a new DIAN electronic invoice.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-display font-bold mb-4">Customer Details</h3>
              <Label>Select Customer</Label>
              <select 
                className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                required
              >
                <option value="">-- Choose a customer --</option>
                {customers?.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.nit})</option>
                ))}
              </select>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-display font-bold">Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="gap-2">
                  <Plus className="w-4 h-4" /> Add Line
                </Button>
              </div>

              {items.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground">No items added. Click 'Add Line' to begin.</p>
                </div>
              )}

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-accent/30 p-4 rounded-xl">
                    <div className="flex-1 min-w-[200px]">
                      <Label className="text-xs">Product / Service</Label>
                      <select 
                        className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:border-primary"
                        value={item.productId}
                        onChange={e => handleProductChange(index, e.target.value)}
                        required
                      >
                        <option value="">Select...</option>
                        {products?.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" min="1" className="h-11 rounded-lg" value={item.quantity} onChange={e => handleQuantityChange(index, parseInt(e.target.value) || 1)} required />
                    </div>
                    <div className="w-32">
                      <Label className="text-xs">Price</Label>
                      <Input type="number" readOnly className="h-11 rounded-lg bg-accent/50" value={item.price} />
                    </div>
                    <div className="w-32">
                      <Label className="text-xs">Total</Label>
                      <div className="h-11 flex items-center px-3 font-semibold text-foreground bg-background rounded-lg border border-border">
                        ${(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-11 w-11 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveItem(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8 bg-gradient-to-b from-card to-card/50 border-primary/20">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold mb-6">Summary</h3>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA (19%)</span>
                  <span className="text-foreground font-medium">${iva.toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between items-center">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-emerald-400">${total.toLocaleString()}</span>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full text-base" disabled={createInvoice.isPending}>
                {createInvoice.isPending ? "Signing & Emitting..." : "Issue E-Invoice"}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">This action is irreversible and registers with DIAN.</p>
            </Card>
          </div>
        </div>
      </form>
    </Layout>
  );
}
