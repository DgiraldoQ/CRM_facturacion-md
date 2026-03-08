import { useState } from "react";
import { Layout } from "@/components/layout";
import { useProducts, useCreateProduct, useDeleteProduct } from "@/hooks/use-products";
import { Button, Input, Label, Card, Dialog } from "@/components/ui/shared";
import { Plus, Search, Trash2, Edit3 } from "lucide-react";

export default function ProductsList() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const [formData, setFormData] = useState({ name: "", price: "", ivaType: "STANDARD", stock: "0" });

  const filteredProducts = products?.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate({
      name: formData.name,
      price: parseInt(formData.price),
      ivaType: formData.ivaType,
      stock: parseInt(formData.stock) || 0
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        setFormData({ name: "", price: "", ivaType: "STANDARD", stock: "0" });
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your inventory and services.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <Card className="mb-6 p-2">
        <Input 
          placeholder="Search products..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="border-none bg-transparent shadow-none"
        />
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Price</th>
                <th className="p-4">IVA Type</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>}
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-accent/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{product.name}</td>
                  <td className="p-4">${product.price.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-accent text-foreground">
                      {product.ivaType}
                    </span>
                  </td>
                  <td className="p-4">{product.stock}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => { if(confirm("Are you sure?")) deleteProduct.mutate(product.id) }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && !isLoading && (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="New Product">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Product Name</Label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price (COP)</Label>
              <Input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
          </div>
          <div>
            <Label>IVA Type</Label>
            <select 
              className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              value={formData.ivaType} 
              onChange={e => setFormData({...formData, ivaType: e.target.value})}
            >
              <option value="STANDARD">Standard (19%)</option>
              <option value="REDUCED">Reduced (5%)</option>
              <option value="ZERO">Zero (0%)</option>
              <option value="EXCLUDED">Excluded</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createProduct.isPending}>Save Product</Button>
          </div>
        </form>
      </Dialog>
    </Layout>
  );
}
