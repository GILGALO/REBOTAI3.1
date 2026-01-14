import { Signal } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Target, ShieldAlert, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SignalCardProps {
  signal: Signal;
}

export function SignalCard({ signal }: SignalCardProps) {
  const isBuy = signal.action.includes("BUY");
  const timeAgo = signal.timestamp ? formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true }) : 'Just now';

  // Parse start/end time from reasoning if present
  const startTime = signal.reasoning?.match(/⏰ Start Time: (.*?)\n/)?.[1];
  const endTime = signal.reasoning?.match(/🏁 End Time: (.*?)\n/)?.[1];
  const cleanReasoning = signal.reasoning?.split('\n').slice(2).join('\n') || signal.reasoning;

  return (
    <div className="group relative bg-card hover:bg-card/80 border border-border rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold tracking-widest text-primary uppercase">REPLIT AI</span>
        <div className="flex items-center gap-2">
           {signal.sentToTelegram && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] px-2 h-5">
                TELEGRAM
              </Badge>
            )}
          <span className="text-xs font-mono text-muted-foreground">{timeAgo}</span>
        </div>
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
            <h3 className="font-bold text-xl font-display flex items-center gap-2">
              📊 Pair: {signal.pair}
            </h3>
            <div className={cn("text-sm font-bold tracking-wide flex items-center gap-1", isBuy ? "text-primary" : "text-destructive")}>
              Action: {signal.action} {isBuy ? '📈' : '📉'}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between items-center bg-secondary/20 p-2 rounded-lg">
          <span className="text-muted-foreground">🎯 Confidence:</span>
          <span className="font-bold text-primary">{signal.confidence}% 🔥</span>
        </div>
        {startTime && (
          <div className="flex justify-between items-center px-2">
            <span className="text-muted-foreground">⏰ Start Time:</span>
            <span className="font-mono">{startTime}</span>
          </div>
        )}
        {endTime && (
          <div className="flex justify-between items-center px-2">
            <span className="text-muted-foreground">🏁 End Time:</span>
            <span className="font-mono">{endTime}</span>
          </div>
        )}
        <div className="flex justify-between items-center px-2">
          <span className="text-muted-foreground">📍 Session:</span>
          <span className="font-medium">{signal.session}</span>
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

      <div className="pt-3 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground italic line-clamp-2">{cleanReasoning}</p>
      </div>
    </div>
  );
}
