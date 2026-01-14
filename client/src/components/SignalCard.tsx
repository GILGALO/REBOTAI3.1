import { Signal } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Target, ShieldAlert, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SignalCardProps {
  signal: Signal;
}

export function SignalCard({ signal }: SignalCardProps) {
  const isBuy = signal.action === "BUY";
  const timeAgo = signal.timestamp ? formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true }) : 'Just now';

  return (
    <div className="group relative bg-card hover:bg-card/80 border border-border rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20">
      <div className="absolute top-4 right-4 flex items-center gap-2">
         {signal.sentToTelegram && (
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] px-2 h-5">
              TELEGRAM
            </Badge>
          )}
        <span className="text-xs font-mono text-muted-foreground">{timeAgo}</span>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center shadow-lg",
            isBuy ? "bg-primary/10 text-primary shadow-primary/10" : "bg-destructive/10 text-destructive shadow-destructive/10"
          )}>
            {isBuy ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="font-bold text-xl font-display">{signal.pair}</h3>
            <div className={cn("text-sm font-bold tracking-wide", isBuy ? "text-primary" : "text-destructive")}>
              {signal.action} @ {signal.entryPrice}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground font-medium uppercase">Take Profit</span>
          </div>
          <span className="font-mono font-semibold text-primary">{signal.takeProfit}</span>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
            <span className="text-xs text-muted-foreground font-medium uppercase">Stop Loss</span>
          </div>
          <span className="font-mono font-semibold text-destructive">{signal.stopLoss}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Confidence</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
             <div 
               className={cn("h-full rounded-full", signal.confidence > 70 ? "bg-primary" : "bg-yellow-500")} 
               style={{ width: `${signal.confidence}%` }}
             />
           </div>
           <span className="text-sm font-bold font-mono">{signal.confidence}%</span>
        </div>
      </div>
    </div>
  );
}
