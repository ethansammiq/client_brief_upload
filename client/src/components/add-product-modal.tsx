import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  targetingDetails: z.string().optional(),
  adSizes: z.string().optional(),
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
      site: "MiQ",
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
        site: "MiQ",
        placementName: data.placementName,
        targetingDetails: product.targetingDetails,
        adSizes: product.adSizes,
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Add {product.name} to Media Plan
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Configure the campaign details for this product placement
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">Site</FormLabel>
                  <div className="p-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 font-medium">
                    MiQ
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="placementName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">Placement Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter placement name" 
                          className="h-9"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h3 className="text-base font-semibold text-gray-900">Product Information</h3>
              <div className="space-y-3">
                <div>
                  <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">Targeting Details</FormLabel>
                  <div className="p-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 leading-relaxed">
                    {product.targetingDetails || "No targeting details specified"}
                  </div>
                </div>
                
                <div>
                  <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">Ad Sizes</FormLabel>
                  <div className="p-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700">
                    <div className="space-y-2">
                      {(product.adSizes || "No ad sizes specified").split(/(?=Desktop:|Tablet:|Mobile:)/g).filter(Boolean).map((platformGroup, index) => {
                        const lines = platformGroup.trim().split(' ');
                        const platform = lines[0]; // Desktop:, Tablet:, Mobile:
                        const sizes = lines.slice(1).join(' ').split(',').map(s => s.trim()).filter(Boolean);
                        
                        return (
                          <div key={index} className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-gray-900 min-w-[80px]">
                              {platform}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {sizes.map((size, sizeIndex) => (
                                <span key={sizeIndex} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                                  {size}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Schedule & Pricing Information */}
            <div className="grid grid-cols-2 gap-4">
              {/* Campaign Schedule */}
              <div className="bg-green-50 p-4 rounded-lg space-y-3">
                <h3 className="text-base font-semibold text-gray-900">Campaign Schedule</h3>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" className="h-9" {...field} />
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
                        <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">End Date</FormLabel>
                        <FormControl>
                          <Input type="date" className="h-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Pricing Information */}
              <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                <h3 className="text-base font-semibold text-gray-900">Pricing Information</h3>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="rateModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">Rate Model</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9">
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
                        <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">Rate ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            className="h-9"
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
                        <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">Units</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1,000,000" 
                            className="h-9"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="px-6 py-2 h-11"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addToMediaPlanMutation.isPending}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 h-11"
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