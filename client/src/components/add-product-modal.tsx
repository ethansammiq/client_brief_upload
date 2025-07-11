import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, InsertMediaPlanLineItem } from "@shared/schema";

const addProductSchema = z.object({
  site: z.string().min(1, "Site is required"),
  placementName: z.string().min(1, "Placement name is required"),
  targetingDetails: z.string().min(1, "Targeting details are required"),
  adSizes: z.string().min(1, "Ad sizes are required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  rateModel: z.enum(["CPM", "dCPM", "CPCV", "CPC"]),
  rate: z.string().min(1, "Rate is required"),
  units: z.string().min(1, "Units are required"),
});

type AddProductForm = z.infer<typeof addProductSchema>;

interface AddProductModalProps {
  product: Product;
  selectedVersionId: number;
  children: React.ReactNode;
}

export default function AddProductModal({ product, selectedVersionId, children }: AddProductModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddProductForm>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      site: "",
      placementName: product.placementName || "",
      targetingDetails: product.targetingDetails || "",
      adSizes: product.adSizes || "",
      startDate: "",
      endDate: "",
      rateModel: "CPM",
      rate: "25.00",
      units: "1000000",
    },
  });

  const addToMediaPlanMutation = useMutation({
    mutationFn: async (data: AddProductForm) => {
      // Calculate total cost based on rate model
      const rate = parseFloat(data.rate);
      const units = parseFloat(data.units);
      let totalCost = 0;

      switch (data.rateModel) {
        case "CPM":
        case "dCPM":
          totalCost = (rate * units) / 1000;
          break;
        case "CPCV":
        case "CPC":
          totalCost = rate * units;
          break;
        default:
          totalCost = rate * units;
      }

      const lineItem: InsertMediaPlanLineItem = {
        mediaPlanVersionId: selectedVersionId,
        productId: product.id,
        lineItemName: data.placementName,
        site: data.site,
        placementName: data.placementName,
        targetingDetails: data.targetingDetails,
        adSizes: data.adSizes,
        startDate: data.startDate,
        endDate: data.endDate,
        rateModel: data.rateModel,
        cpmRate: data.rate,
        flatRate: "0",
        impressions: parseInt(data.units),
        totalCost: totalCost.toFixed(2),
        sortOrder: 0,
      };

      return apiRequest("POST", "/api/line-items", lineItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/media-plan-versions/${selectedVersionId}/line-items`] 
      });
      toast({
        title: "Product Added",
        description: "Product has been added to your media plan.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to media plan.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddProductForm) => {
    addToMediaPlanMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add {product.name} to Media Plan</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter site name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="placementName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placement Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter placement name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetingDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Targeting Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter targeting details" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adSizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Sizes</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 728x90, 300x250" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="rateModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rate model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CPM">CPM</SelectItem>
                        <SelectItem value="dCPM">dCPM</SelectItem>
                        <SelectItem value="CPCV">CPCV</SelectItem>
                        <SelectItem value="CPC">CPC</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Units</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1000000" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addToMediaPlanMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {addToMediaPlanMutation.isPending ? "Adding..." : "Add to Media Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}