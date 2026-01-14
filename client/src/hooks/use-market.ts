import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useMarketStatus() {
  return useQuery({
    queryKey: [api.market.status.path],
    queryFn: async () => {
      const res = await fetch(api.market.status.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch market status");
      return api.market.status.responses[200].parse(await res.json());
    },
    refetchInterval: 60000, // Check every minute
  });
}
