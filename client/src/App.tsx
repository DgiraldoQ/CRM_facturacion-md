import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-auth";

// Pages
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import RegisterBusiness from "./pages/business/register";
import Dashboard from "./pages/dashboard";
import ProductsList from "./pages/products";
import CustomersList from "./pages/customers";
import InvoicesList from "./pages/invoices";
import NewInvoice from "./pages/invoices/new";
import InvoiceView from "./pages/invoices/view";
import NotFound from "./pages/not-found";

function ProtectedRoute({ component: Component, requireBusiness = true }: { component: any, requireBusiness?: boolean }) {
  const { data: user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && user && requireBusiness && !user.businessId) {
      setLocation("/business/register");
    }
  }, [user, isLoading, requireBusiness, setLocation]);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>;
  
  if (!user) return null;
  if (requireBusiness && !user.businessId) return null;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/business/register">
        {() => <ProtectedRoute component={RegisterBusiness} requireBusiness={false} />}
      </Route>
      
      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/products">
        {() => <ProtectedRoute component={ProductsList} />}
      </Route>
      <Route path="/customers">
        {() => <ProtectedRoute component={CustomersList} />}
      </Route>
      <Route path="/invoices">
        {() => <ProtectedRoute component={InvoicesList} />}
      </Route>
      <Route path="/invoices/new">
        {() => <ProtectedRoute component={NewInvoice} />}
      </Route>
      <Route path="/invoices/:id">
        {() => <ProtectedRoute component={InvoiceView} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
