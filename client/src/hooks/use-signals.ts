import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type GenerateSignalRequest } from "@shared/routes";

export function useSignals(params?: { limit?: number; pair?: string }) {
  // Construct query key including params to ensure refetch on change
  const queryKey = [api.signals.list.path, params];
  
  // Build URL with query params
  const url = new URL(api.signals.list.path, window.location.origin);
  if (params?.limit) url.searchParams.append("limit", params.limit.toString());
  if (params?.pair) url.searchParams.append("pair", params.pair);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch signals");
      return api.signals.list.responses[200].parse(await res.json());
    },
    refetchInterval: 10000, // Refresh every 10s for new signals
  });
}

export function useGenerateSignal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: GenerateSignalRequest) => {
      const res = await fetch(api.signals.generate.path, {
        method: api.signals.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.signals.generate.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to generate signal");
      }
      
      return api.signals.generate.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.signals.list.path] });
    },
  });
}
