import { useState } from "react";
import { Layout } from "@/components/layout";
import { useCustomers, useCreateCustomer } from "@/hooks/use-customers";
import { Button, Input, Label, Card, Dialog } from "@/components/ui/shared";
import { Plus, Search, Mail, Phone, MapPin } from "lucide-react";

export default function CustomersList() {
  const { data: customers, isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const [formData, setFormData] = useState({ name: "", nit: "", dv: "1", email: "", phone: "", address: "" });

  const filteredCustomers = customers?.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.nit.includes(search)) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer.mutate(formData, {
      onSuccess: () => {
        setIsAddOpen(false);
        setFormData({ name: "", nit: "", dv: "1", email: "", phone: "", address: "" });
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-2">Manage your client database.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      <Card className="mb-6 p-2">
        <Input 
          placeholder="Search customers by name or NIT..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="border-none bg-transparent shadow-none"
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading && <div className="col-span-full text-center py-10">Loading...</div>}
        {filteredCustomers.map(customer => (
          <Card key={customer.id} className="p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-border/50">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
                {customer.name.charAt(0)}
              </div>
            </div>
            <h3 className="font-bold text-lg text-foreground truncate">{customer.name}</h3>
            <p className="text-sm font-medium text-muted-foreground mb-4">NIT: {customer.nit}-{customer.dv}</p>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> <span className="truncate">{customer.email}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {customer.phone}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> <span className="truncate">{customer.address}</span></div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="New Customer">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Legal Name / Razon Social</Label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <Label>NIT / ID</Label>
              <Input required value={formData.nit} onChange={e => setFormData({...formData, nit: e.target.value})} />
            </div>
            <div>
              <Label>DV</Label>
              <Input required value={formData.dv} onChange={e => setFormData({...formData, dv: e.target.value})} maxLength={1} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createCustomer.isPending}>Save Customer</Button>
          </div>
        </form>
      </Dialog>
    </Layout>
  );
}
