import { useMarketStatus } from "@/hooks/use-market";
import { Globe, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function MarketStatus() {
  const { data: status, isLoading } = useMarketStatus();

  if (isLoading) return <Skeleton className="h-12 w-full rounded-xl bg-secondary" />;

  const isOpen = status?.isOpen;
  const session = status?.session;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isOpen ? 'bg-primary/20' : 'bg-destructive/20'}`}>
          <Globe className={`h-6 w-6 ${isOpen ? 'text-primary' : 'text-destructive'}`} />
        </div>
        <div>
          <h3 className="text-muted-foreground text-sm font-medium">Market Status</h3>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display">{isOpen ? "Market Open" : "Market Closed"}</h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${isOpen ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
              {isOpen ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Session</p>
          <p className="font-mono text-lg font-bold text-foreground">{session}</p>
        </div>
      </div>
    </div>
  );
}
