import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateSignal } from "@/hooks/use-signals";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const signalFormSchema = z.object({
  pair: z.string().min(1, "Pair is required"),
  direction: z.enum(["LONG", "SHORT"]),
  entry: z.string().min(1, "Entry price is required"),
  stopLoss: z.string().min(1, "Stop loss is required"),
  takeProfits: z.string().min(1, "Take profits are required"),
  leverage: z.string().min(1, "Leverage is required"),
});

type SignalFormData = z.infer<typeof signalFormSchema>;

interface SignalFormProps {
  tier: "FREE" | "PRO";
  onSuccess: () => void;
}

export function SignalForm({ tier, onSuccess }: SignalFormProps) {
  const createSignal = useCreateSignal();

  const form = useForm<SignalFormData>({
    resolver: zodResolver(signalFormSchema),
    defaultValues: {
      pair: "",
      direction: "LONG",
      entry: "",
      stopLoss: "",
      takeProfits: "",
      leverage: "10x",
    },
  });

  const onSubmit = (data: SignalFormData) => {
    createSignal.mutate(
      { ...data, status: "ACTIVE", tier },
      {
        onSuccess: () => {
          form.reset();
          onSuccess();
        },
      }
    );
  };

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-bold mb-4">Create New {tier} Signal</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="pair"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trading Pair</FormLabel>
                <FormControl>
                  <Input placeholder="BTC/USDT" {...field} data-testid="input-pair" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Direction</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-direction">
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LONG">LONG</SelectItem>
                    <SelectItem value="SHORT">SHORT</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="entry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Price</FormLabel>
                <FormControl>
                  <Input placeholder="45000" {...field} data-testid="input-entry" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stopLoss"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stop Loss</FormLabel>
                <FormControl>
                  <Input placeholder="44000" {...field} data-testid="input-stoploss" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="takeProfits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Take Profits (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="46000, 47000, 48000" {...field} data-testid="input-takeprofits" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leverage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leverage</FormLabel>
                <FormControl>
                  <Input placeholder="10x" {...field} data-testid="input-leverage" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={createSignal.isPending}
              data-testid="button-submit-signal"
            >
              {createSignal.isPending ? "Creating..." : "Create Signal"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
