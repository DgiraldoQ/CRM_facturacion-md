import { Layout } from "@/components/layout";
import { useInvoices } from "@/hooks/use-invoices";
import { Card } from "@/components/ui/shared";
import { format } from "date-fns";
import { Link } from "wouter";
import { TrendingUp, FileText, DollarSign, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: invoices, isLoading } = useInvoices();

  if (isLoading) return <Layout><div className="text-foreground animate-pulse">Loading dashboard...</div></Layout>;

  const totalInvoices = invoices?.length || 0;
  const totalRevenue = invoices?.reduce((acc, inv) => acc + inv.total, 0) || 0;
  
  // Fake chart data based on invoices (simplified for UI demonstration)
  const chartData = [
    { name: 'Mon', total: 4000 },
    { name: 'Tue', total: 3000 },
    { name: 'Wed', total: 2000 },
    { name: 'Thu', total: 2780 },
    { name: 'Fri', total: 1890 },
    { name: 'Sat', total: 2390 },
    { name: 'Sun', total: totalRevenue > 0 ? totalRevenue : 3490 },
  ];

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your business today.</p>
        </div>
        <Link href="/invoices/new" className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 h-11 px-6">
          Create New Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground font-medium mb-1">Total Revenue</p>
              <h2 className="text-3xl font-bold text-foreground">${totalRevenue.toLocaleString()}</h2>
            </div>
            <div className="p-3 bg-primary/20 rounded-xl text-primary"><DollarSign className="w-6 h-6" /></div>
          </div>
          <div className="mt-4 flex items-center text-sm text-emerald-400 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" /> +12.5% from last month
          </div>
        </Card>
        
        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground font-medium mb-1">Invoices Issued</p>
              <h2 className="text-3xl font-bold text-foreground">{totalInvoices}</h2>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><FileText className="w-6 h-6" /></div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-accent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground font-medium mb-1">Pending DIAN</p>
              <h2 className="text-3xl font-bold text-foreground">0</h2>
            </div>
            <div className="p-3 bg-accent rounded-xl text-muted-foreground"><Activity className="w-6 h-6" /></div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">All synced successfully.</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-xl font-display font-semibold mb-6">Revenue Overview</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-display font-semibold mb-6">Recent Invoices</h3>
          <div className="space-y-4">
            {invoices?.slice(0, 5).map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-accent/50 transition-colors">
                <div>
                  <p className="font-medium text-foreground">{inv.number}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(inv.date), 'MMM dd, yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${inv.total.toLocaleString()}</p>
                  <Link href={`/invoices/${inv.id}`} className="text-xs text-primary hover:underline">View PDF</Link>
                </div>
              </div>
            ))}
            {(!invoices || invoices.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No invoices yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
