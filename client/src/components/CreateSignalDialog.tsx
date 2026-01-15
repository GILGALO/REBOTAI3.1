import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerateSignal } from "@/hooks/use-signals";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  pair: z.string().min(1, "Pair is required"),
});

export function CreateSignalDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: generate, isPending } = useGenerateSignal();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pair: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    generate(
      { pair: values.pair, manual: true },
      {
        onSuccess: () => {
          setOpen(false);
          toast({
            title: "Signal Generated",
            description: `Successfully analyzed and generated signal for ${values.pair}`,
            variant: "default",
          });
          form.reset();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20">
          <Wand2 className="h-4 w-4" />
          Generate Signal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Trading Signal</DialogTitle>
          <DialogDescription>
            Manually trigger the algorithm to analyze a pair and generate a signal if conditions are met.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="pair"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency Pair</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a pair" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                      <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                      <SelectItem value="USD/JPY">USD/JPY</SelectItem>
                      <SelectItem value="AUD/USD">AUD/USD</SelectItem>
                      <SelectItem value="USD/CAD">USD/CAD</SelectItem>
                      <SelectItem value="USD/CHF">USD/CHF</SelectItem>
                      <SelectItem value="NZD/USD">NZD/USD</SelectItem>
                      <SelectItem value="EUR/GBP">EUR/GBP</SelectItem>
                      <SelectItem value="EUR/JPY">EUR/JPY</SelectItem>
                      <SelectItem value="GBP/JPY">GBP/JPY</SelectItem>
                      <SelectItem value="XAU/USD">XAU/USD (Gold)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Market...
                </>
              ) : (
                "Generate Signal"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
