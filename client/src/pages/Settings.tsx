import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, Bot, MessageCircle } from "lucide-react";
import { useEffect } from "react";

const pairs = [
  { id: "EUR/USD", label: "EUR/USD" },
  { id: "GBP/USD", label: "GBP/USD" },
  { id: "USD/JPY", label: "USD/JPY" },
  { id: "AUD/USD", label: "AUD/USD" },
  { id: "USD/CAD", label: "USD/CAD" },
  { id: "XAU/USD", label: "XAU/USD" },
];

const formSchema = z.object({
  isAutoMode: z.boolean(),
  telegramEnabled: z.boolean(),
  telegramChatId: z.string().optional(),
  activePairs: z.array(z.string()).refine((value) => value.length > 0, {
    message: "You have to select at least one pair.",
  }),
});

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isAutoMode: false,
      telegramEnabled: false,
      telegramChatId: "",
      activePairs: [],
    },
  });

  // Update form values when data loads
  useEffect(() => {
    if (settings) {
      form.reset({
        isAutoMode: settings.isAutoMode ?? false,
        telegramEnabled: settings.telegramEnabled ?? false,
        telegramChatId: settings.telegramChatId ?? "",
        activePairs: settings.activePairs ?? [],
      });
    }
  }, [settings, form]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    updateSettings(data, {
      onSuccess: () => {
        toast({
          title: "Settings updated",
          description: "Your bot configuration has been saved.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  }

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-2xl" />;
  }

  return (
    <div className="space-y-8 animate-enter max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-gradient">Bot Settings</h1>
        <p className="text-muted-foreground mt-1">Configure automation and notification preferences.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Automation</CardTitle>
                  <CardDescription>Control how the bot generates signals.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="isAutoMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border p-4 bg-background/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-semibold">Auto-Trading Mode</FormLabel>
                      <FormDescription>
                        Automatically generate signals based on market conditions without manual intervention.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activePairs"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base font-semibold">Active Pairs</FormLabel>
                      <FormDescription>
                        Select which currency pairs the bot should monitor.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {pairs.map((pair) => (
                        <FormField
                          key={pair.id}
                          control={form.control}
                          name="activePairs"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={pair.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-3 hover:bg-secondary/40 transition-colors"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(pair.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, pair.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== pair.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer w-full">
                                  {pair.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Get alerted instantly when signals are generated.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="telegramEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border p-4 bg-background/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-semibold">Telegram Integration</FormLabel>
                      <FormDescription>
                        Send buy/sell signals directly to your Telegram channel or chat.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("telegramEnabled") && (
                <FormField
                  control={form.control}
                  name="telegramChatId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chat ID</FormLabel>
                      <FormControl>
                        <Input placeholder="@channelname or -100123456789" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormDescription>
                        The ID of the channel or user to receive messages. Ensure the bot is an admin.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="w-full md:w-auto font-semibold" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
