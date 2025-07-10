import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Copy, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { 
  RfpResponse, 
  MediaPlanVersion, 
  MediaPlanLineItem, 
  Product,
  InsertMediaPlanVersion 
} from "@shared/schema";

interface MediaPlanBuilderProps {
  rfpResponse?: RfpResponse;
  mediaPlanVersions: MediaPlanVersion[];
  selectedVersionId: number;
  onVersionChange: (versionId: number) => void;
}

export default function MediaPlanBuilder({
  rfpResponse,
  mediaPlanVersions,
  selectedVersionId,
  onVersionChange,
}: MediaPlanBuilderProps) {
  const [editingLineItem, setEditingLineItem] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentVersion = mediaPlanVersions.find(v => v.id === selectedVersionId);

  const { data: lineItems = [] } = useQuery<MediaPlanLineItem[]>({
    queryKey: [`/api/media-plan-versions/${selectedVersionId}/line-items`],
    enabled: !!selectedVersionId,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const createVersionMutation = useMutation({
    mutationFn: async () => {
      if (!rfpResponse) return;
      
      const newVersion: InsertMediaPlanVersion = {
        rfpResponseId: rfpResponse.id,
        versionNumber: mediaPlanVersions.length + 1,
        title: `Plan Version ${mediaPlanVersions.length + 1}`,
        totalBudget: "0",
        totalImpressions: 0,
        avgCpm: "0",
        isActive: true,
      };
      
      return apiRequest("POST", "/api/media-plan-versions", newVersion);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/rfp-responses/${rfpResponse?.id}/media-plan-versions`] 
      });
      toast({
        title: "Version Created",
        description: "New media plan version has been created.",
      });
    },
  });

  const updateLineItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MediaPlanLineItem> }) => {
      return apiRequest("PUT", `/api/line-items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/media-plan-versions/${selectedVersionId}/line-items`] 
      });
      setEditingLineItem(null);
      toast({
        title: "Updated",
        description: "Line item has been updated.",
      });
    },
  });

  const deleteLineItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/line-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/media-plan-versions/${selectedVersionId}/line-items`] 
      });
      toast({
        title: "Deleted",
        description: "Line item has been deleted.",
      });
    },
  });

  const getProductById = (productId: number) => {
    return products.find(p => p.id === productId);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Display': 'bg-blue-100 text-blue-800',
      'Video': 'bg-purple-100 text-purple-800',
      'Audio': 'bg-yellow-100 text-yellow-800',
      'Social': 'bg-pink-100 text-pink-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const calculateTotals = () => {
    const totalBudget = lineItems.reduce((sum, item) => sum + parseFloat(item.totalCost), 0);
    const totalImpressions = lineItems.reduce((sum, item) => sum + item.impressions, 0);
    const avgCpm = totalImpressions > 0 ? (totalBudget / totalImpressions) * 1000 : 0;
    
    return {
      totalBudget: totalBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      totalImpressions: totalImpressions.toLocaleString(),
      avgCpm: `$${avgCpm.toFixed(2)}`,
    };
  };

  const { totalBudget, totalImpressions, avgCpm } = calculateTotals();

  const handleLineItemUpdate = (lineItem: MediaPlanLineItem, field: string, value: string | number) => {
    const updatedItem = { ...lineItem, [field]: value };
    
    if (field === 'cpmRate' || field === 'impressions') {
      const cpm = parseFloat(updatedItem.cpmRate);
      const impressions = updatedItem.impressions;
      updatedItem.totalCost = ((cpm * impressions) / 1000).toFixed(2);
    }
    
    updateLineItemMutation.mutate({ id: lineItem.id, data: updatedItem });
  };

  return (
    <div className="w-full">
      {/* RFP Info and Controls */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {rfpResponse?.title || "Loading..."}
          </h3>
          <p className="text-sm text-gray-600">
            Client: {rfpResponse?.clientName || "Loading..."} | 
            Due: {rfpResponse?.dueDate || "Loading..."}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select 
            value={selectedVersionId.toString()} 
            onValueChange={(value) => onVersionChange(parseInt(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {mediaPlanVersions.map((version) => (
                <SelectItem key={version.id} value={version.id.toString()}>
                  {version.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => createVersionMutation.mutate()}
            disabled={createVersionMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Version
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Budget</div>
          <div className="text-xl font-semibold text-green-600">{totalBudget}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Impressions</div>
          <div className="text-xl font-semibold text-blue-600">{totalImpressions}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Average CPM</div>
          <div className="text-xl font-semibold text-purple-600">{avgCpm}</div>
        </div>
      </div>

      {/* Media Plan Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">
            {currentVersion?.title || "Media Plan"}
          </h4>
        </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Line Item / Placement
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Type
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Targeting Details
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Sizes
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPM Rate
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No line items yet. Add products from the library to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  lineItems.map((item) => {
                    const product = getProductById(item.productId);
                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="max-w-xs">
                          <Input
                            value={item.lineItemName}
                            onChange={(e) => handleLineItemUpdate(item, 'lineItemName', e.target.value)}
                            className="w-full text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={getCategoryColor(product?.category || 'Display')}
                          >
                            {product?.name || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-sm">
                          <div className="text-xs text-gray-600">
                            {product?.targetingDetails ? product.targetingDetails.substring(0, 100) + '...' : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-xs text-gray-600">
                            {product?.adSizes || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-1">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.cpmRate}
                              onChange={(e) => handleLineItemUpdate(item, 'cpmRate', e.target.value)}
                              className="w-20"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.impressions}
                            onChange={(e) => handleLineItemUpdate(item, 'impressions', parseInt(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-secondary">
                            ${parseFloat(item.totalCost).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-primary hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteLineItemMutation.mutate(item.id)}
                              disabled={deleteLineItemMutation.isPending}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <div className="text-sm">
                  <span className="text-gray-500">Total Impressions:</span>
                  <span className="font-medium text-gray-900 ml-2">{totalImpressions}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Avg CPM:</span>
                  <span className="font-medium text-gray-900 ml-2">{avgCpm}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" className="text-gray-700 hover:bg-gray-200">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Plan
                </Button>
              </div>
            </div>
          </div>
        </div>

      {/* Campaign Performance Metrics */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Campaign Performance Forecast</h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2.8M</div>
              <div className="text-sm text-gray-500">Estimated Reach</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">2.3</div>
              <div className="text-sm text-gray-500">Avg Frequency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0.85%</div>
              <div className="text-sm text-gray-500">Expected CTR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">78%</div>
              <div className="text-sm text-gray-500">Video Completion</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
