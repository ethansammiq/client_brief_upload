import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertRfpResponseSchema, type RfpResponse, type InsertRfpResponse } from "@shared/schema";

interface RfpFormProps {
  rfpResponse?: RfpResponse;
  onSuccess?: (rfpResponse?: RfpResponse) => void;
  children?: React.ReactNode;
}

export default function RfpForm({ rfpResponse, onSuccess, children }: RfpFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!rfpResponse;

  const form = useForm<InsertRfpResponse>({
    resolver: zodResolver(insertRfpResponseSchema),
    defaultValues: {
      title: rfpResponse?.title || "",
      clientName: rfpResponse?.clientName || "",
      dueDate: rfpResponse?.dueDate || "",
      campaignStartDate: rfpResponse?.campaignStartDate || "",
      campaignEndDate: rfpResponse?.campaignEndDate || "",
      status: rfpResponse?.status || "draft",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertRfpResponse) => {
      if (isEditing) {
        return apiRequest("PUT", `/api/rfp-responses/${rfpResponse.id}`, data);
      } else {
        return apiRequest("POST", "/api/rfp-responses", data);
      }
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/rfp-responses'] });
      setOpen(false);
      form.reset();
      
      // Parse the response to get the actual data
      const data = await response.json();
      onSuccess?.(data);
      
      toast({
        title: isEditing ? "Updated" : "Created",
        description: `RFP response has been ${isEditing ? "updated" : "created"} successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save RFP response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertRfpResponse) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className={isEditing ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}>
            {isEditing ? (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Campaign
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Campaign" : "Create New Campaign"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update campaign details and settings." : "Fill in the details to create a new media campaign."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Q4 2024 Brand Campaign" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="campaignStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="campaignEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the campaign and requirements..."
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
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Objectives</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brand awareness, lead generation, conversions..."
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
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Demographics, interests, behaviors..."
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
              name="kpis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Performance Indicators</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="CTR, impressions, conversions, ROAS..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : (isEditing ? "Update" : "Create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}