import { useState } from "react";
import { useSignals } from "@/hooks/use-signals";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2 } from "lucide-react";

export default function History() {
  const [filterPair, setFilterPair] = useState("ALL");
  const { data: signals, isLoading } = useSignals({ limit: 50 }); // Fetch more for history

  // Client-side filtering for simplicity, though backend filtering is better for large datasets
  const filteredSignals = signals?.filter(signal => 
    filterPair === "ALL" || signal.pair === filterPair
  );

  return (
    <div className="space-y-8 animate-enter">
      <div>
        <h1 className="text-3xl font-display font-bold text-gradient">Signal History</h1>
        <p className="text-muted-foreground mt-1">Comprehensive log of all generated trading signals.</p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search pairs..." 
              className="pl-9 bg-secondary/50 border-white/5"
              disabled
            />
          </div>
          <div className="w-full md:w-48">
             <Select value={filterPair} onValueChange={setFilterPair}>
              <SelectTrigger className="bg-secondary/50 border-white/5">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Pair" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Pairs</SelectItem>
                <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                <SelectItem value="USD/JPY">USD/JPY</SelectItem>
                <SelectItem value="XAU/USD">XAU/USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="font-semibold text-muted-foreground">Date & Time</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Pair</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Action</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Entry</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Stop Loss</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Take Profit</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredSignals && filteredSignals.length > 0 ? (
                filteredSignals.map((signal) => (
                  <TableRow key={signal.id} className="border-border/50 hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {signal.timestamp ? format(new Date(signal.timestamp), "MMM dd, HH:mm") : "-"}
                    </TableCell>
                    <TableCell className="font-bold">{signal.pair}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={signal.action === "BUY" 
                          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" 
                          : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                        }
                      >
                        {signal.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{signal.entryPrice}</TableCell>
                    <TableCell className="font-mono text-destructive">{signal.stopLoss}</TableCell>
                    <TableCell className="font-mono text-primary">{signal.takeProfit}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground italic">Pending</span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No signals found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
