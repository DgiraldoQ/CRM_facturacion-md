import { useState } from "react";
import { useLocation } from "wouter";
import { useRegisterBusiness } from "@/hooks/use-business";
import { Button, Input, Label, Card } from "@/components/ui/shared";
import { useToast } from "@/hooks/use-toast";
import { Building2, FileText, Phone, Mail, MapPin } from "lucide-react";

export default function RegisterBusiness() {
  const registerBusiness = useRegisterBusiness();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "", nit: "", dv: "", address: "", phone: "", email: "", 
    regime: "COMUN", resolutionPrefix: "SETT", resolutionNumber: "18760000001",
    resolutionFrom: "1", resolutionTo: "5000000", resolutionExpiry: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerBusiness.mutate({
      ...formData,
      resolutionExpiry: new Date(formData.resolutionExpiry)
    }, {
      onSuccess: () => setLocation("/"),
      onError: (err) => toast({ title: "Setup Failed", description: err.message, variant: "destructive" })
    });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">Complete Company Profile</h1>
          <p className="text-muted-foreground text-lg">We need your business details configured for DIAN to start generating valid electronic invoices.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <Label>Company Name (Razon Social)</Label>
                  <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Acme Corp S.A.S" />
                </div>
                <div>
                  <Label>NIT</Label>
                  <Input name="nit" value={formData.nit} onChange={handleChange} required placeholder="900123456" />
                </div>
                <div>
                  <Label>DV (Verification Digit)</Label>
                  <Input name="dv" value={formData.dv} onChange={handleChange} required placeholder="1" maxLength={1} />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-8">
              <h3 className="text-xl font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <Label>Address</Label>
                  <Input name="address" value={formData.address} onChange={handleChange} required placeholder="Calle 123 #45-67, Bogotá" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input name="phone" value={formData.phone} onChange={handleChange} required placeholder="+57 300 123 4567" icon={<Phone className="w-4 h-4" />} />
                </div>
                <div>
                  <Label>Billing Email</Label>
                  <Input name="email" value={formData.email} onChange={handleChange} required type="email" placeholder="billing@acme.com" icon={<Mail className="w-4 h-4" />} />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-8">
              <h3 className="text-xl font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> DIAN Resolution (Facturación)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>Prefix</Label>
                  <Input name="resolutionPrefix" value={formData.resolutionPrefix} onChange={handleChange} required />
                </div>
                <div className="md:col-span-2">
                  <Label>Resolution Number</Label>
                  <Input name="resolutionNumber" value={formData.resolutionNumber} onChange={handleChange} required />
                </div>
                <div>
                  <Label>From Number</Label>
                  <Input name="resolutionFrom" value={formData.resolutionFrom} onChange={handleChange} required />
                </div>
                <div>
                  <Label>To Number</Label>
                  <Input name="resolutionTo" value={formData.resolutionTo} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input type="date" name="resolutionExpiry" value={formData.resolutionExpiry} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button type="submit" size="lg" className="w-full" disabled={registerBusiness.isPending}>
                {registerBusiness.isPending ? "Saving configuration..." : "Complete Setup"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
