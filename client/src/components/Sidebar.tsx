import { Link, useLocation } from "wouter";
import { LayoutDashboard, History, Settings, LineChart, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "Signal History", icon: History },
  { href: "/settings", label: "Bot Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r min-h-screen fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3 border-b border-border/50">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <LineChart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-tight">TradeBot<span className="text-primary">.ai</span></h1>
          <p className="text-xs text-muted-foreground font-medium">Pro Signals</p>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        {items.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "group-hover:text-primary")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-6 mt-auto border-t border-border/50">
        <div className="bg-secondary/30 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            <span className="text-sm font-medium">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
