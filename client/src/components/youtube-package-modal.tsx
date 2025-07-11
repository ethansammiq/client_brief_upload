import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, InsertMediaPlanLineItem } from "@shared/schema";

const youtubePackageSchema = z.object({
  site: z.string().min(1, "Site is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  rateModel: z.enum(["CPM", "dCPM", "CPCV", "CPC"]),
  rate: z.string().min(1, "Rate is required"),
  units: z.string().min(1, "Units are required"),
  selectedPlacements: z.array(z.string()).min(1, "Select at least one placement"),
});

type YouTubePackageForm = z.infer<typeof youtubePackageSchema>;

interface YouTubePackageModalProps {
  product: Product;
  selectedVersionId: number;
  children: React.ReactNode;
  campaignStartDate?: string;
  campaignEndDate?: string;
}

interface PackagePlacement {
  name: string;
  adSizes: string;
  targeting: string;
}

export default function YouTubePackageModal({ 
  product, 
  selectedVersionId, 
  children, 
  campaignStartDate, 
  campaignEndDate 
}: YouTubePackageModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Parse package placements from JSON
  const packagePlacements: PackagePlacement[] = product.packagePlacements 
    ? JSON.parse(product.packagePlacements) 
    : [];

  const form = useForm<YouTubePackageForm>({
    resolver: zodResolver(youtubePackageSchema),
    defaultValues: {
      site: "MiQ",
      startDate: campaignStartDate || "",
      endDate: campaignEndDate || "",
      rateModel: "dCPM",
      rate: "25.00",
      units: "1000000",
      selectedPlacements: [],
    },
  });

  // Update campaign dates when they change
  useEffect(() => {
    if (campaignStartDate && campaignEndDate) {
      console.log("Setting campaign dates:", campaignStartDate, campaignEndDate);
      form.setValue("startDate", campaignStartDate);
      form.setValue("endDate", campaignEndDate);
    }
  }, [campaignStartDate, campaignEndDate, form]);

  const addLineItemMutation = useMutation({
    mutationFn: async (data: YouTubePackageForm) => {
      const selectedPlacementObjects = packagePlacements.filter(p => 
        data.selectedPlacements.includes(p.name)
      );

      // Create a line item for each selected placement
      const lineItems = selectedPlacementObjects.map(placement => {
        const lineItem: InsertMediaPlanLineItem = {
          mediaPlanVersionId: selectedVersionId,
          productId: product.id,
          lineItemName: `${product.name} - ${placement.name}`,
          site: data.site,
          placementName: placement.name,
          targetingDetails: placement.targeting,
          adSizes: placement.adSizes,
          startDate: data.startDate,
          endDate: data.endDate,
          rateModel: data.rateModel,
          cpmRate: data.rate,
          flatRate: "0",
          impressions: parseInt(data.units),
          totalCost: (parseFloat(data.rate) * parseInt(data.units) / 1000).toFixed(2),
          sortOrder: 0,
        };
        return lineItem;
      });

      // Add each line item
      const promises = lineItems.map(lineItem => 
        apiRequest("POST", "/api/line-items", lineItem)
      );

      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rfp-responses'] });
      queryClient.invalidateQueries({ queryKey: [`/api/media-plan-versions/${selectedVersionId}/line-items`] });
      toast({
        title: "Success",
        description: `Added ${form.getValues("selectedPlacements").length} YouTube placements to media plan`,
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Failed to add YouTube package:", error);
      toast({
        title: "Error",
        description: "Failed to add YouTube package to media plan",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: YouTubePackageForm) => {
    addLineItemMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add {product.name} Package
          </DialogTitle>
          <DialogDescription>
            {(() => {
              const targetingDetails = product.targetingDetails;
              if (!targetingDetails) return null;
              
              // Look for text between ** and **
              const noticeMatch = targetingDetails.match(/\*\*(.*?)\*\*/);
              if (noticeMatch) {
                const notice = noticeMatch[1];
                const content = targetingDetails.replace(/\*\*.*?\*\*\s*/, '').trim();
                return (
                  <div>
                    <div className="text-sm font-semibold text-blue-800 bg-blue-50 p-2 rounded mb-3 border border-blue-200">
                      {notice}
                    </div>
                    <div className="text-sm text-gray-600">
                      {content}
                    </div>
                  </div>
                );
              }
              
              return <div className="text-sm text-gray-600">{targetingDetails}</div>;
            })()}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="units"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Units (Impressions)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Package Placements Selection */}
            <div className="space-y-4">
              <div>
                <FormLabel className="text-base font-semibold">Select Placements</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Choose which YouTube placements to include in your media plan
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="selectedPlacements"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-3">
                      {packagePlacements.map((placement) => (
                        <div key={placement.name} className="flex items-start space-x-3 p-4 border rounded-lg">
                          <Checkbox
                            checked={field.value.includes(placement.name)}
                            onCheckedChange={(checked) => {
                              const updatedPlacements = checked
                                ? [...field.value, placement.name]
                                : field.value.filter(p => p !== placement.name);
                              field.onChange(updatedPlacements);
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{placement.name}</h4>
                              <Badge variant="secondary">{placement.adSizes}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addLineItemMutation.isPending}>
                {addLineItemMutation.isPending ? "Adding..." : "Add to Media Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}