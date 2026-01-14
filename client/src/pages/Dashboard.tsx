import { motion } from "framer-motion";
import { useSignals } from "@/hooks/use-signals";
import { MarketStatus } from "@/components/MarketStatus";
import { SignalCard } from "@/components/SignalCard";
import { CreateSignalDialog } from "@/components/CreateSignalDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: signals, isLoading, error } = useSignals({ limit: 6 });

  return (
    <div className="space-y-8 animate-enter">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time market analysis and signal generation.</p>
        </div>
        <CreateSignalDialog />
      </div>

      <MarketStatus />

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            Recent Signals
          </h2>
        </div>

        {error ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center text-destructive flex flex-col items-center">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>Failed to load signals. Please try again later.</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[280px] rounded-2xl bg-secondary/50" />
            ))}
          </div>
        ) : signals && signals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {signals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <SignalCard signal={signal} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-card/30">
            <h3 className="text-lg font-medium text-muted-foreground">No signals generated yet</h3>
            <p className="text-sm text-muted-foreground/60 mt-2">
              Wait for market conditions or generate a manual signal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
