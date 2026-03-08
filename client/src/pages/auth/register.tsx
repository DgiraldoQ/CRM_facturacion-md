import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@/hooks/use-auth";
import { Button, Input, Label } from "@/components/ui/shared";
import { Mail, Lock, Hexagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const register = useRegister();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ email, password }, {
      onSuccess: () => setLocation("/business/register"),
      onError: (err) => toast({ title: "Registration Failed", description: err.message, variant: "destructive" })
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-emerald-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/25 mb-6">
            <Hexagon className="w-8 h-8 text-primary-foreground fill-current" />
          </div>
          <h1 className="text-4xl font-bold font-display text-foreground mb-3">Create an account</h1>
          <p className="text-muted-foreground text-lg">Start issuing electronic invoices today.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card p-8 rounded-3xl border border-border shadow-2xl shadow-black/20 space-y-6">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@company.com" 
              icon={<Mail className="w-5 h-5" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Create a strong password" 
              icon={<Lock className="w-5 h-5" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center mt-8 text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
