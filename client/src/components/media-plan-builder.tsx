import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { 
  MediaPlanVersion, 
  MediaPlanLineItem, 
  InsertMediaPlanVersion, 
  RfpResponse, 
  Product,
  UpdateMediaPlanLineItem
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

  // Get line items for selected version
  const { data: lineItems = [], isLoading: isLineItemsLoading } = useQuery<MediaPlanLineItem[]>({
    queryKey: [`/api/media-plan-versions/${selectedVersionId}/line-items`],
    enabled: !!selectedVersionId,
  });

  // Get products for category lookup
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const createVersionMutation = useMutation({
    mutationFn: async () => {
      const versionCount = mediaPlanVersions.length;
      const newVersion: InsertMediaPlanVersion = {
        rfpResponseId: rfpResponse?.id || 0,
        title: `Version ${versionCount + 1}`,
        versionNumber: versionCount + 1,
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
      queryClient.invalidateQueries({ 
        queryKey: ['/api/rfp-responses'] 
      });
      toast({
        title: "Version Created",
        description: "New media plan version has been created.",
      });
    },
  });

  const duplicateVersionMutation = useMutation({
    mutationFn: async () => {
      const versionCount = mediaPlanVersions.length;
      const newVersion: InsertMediaPlanVersion = {
        rfpResponseId: rfpResponse?.id || 0,
        title: `${currentVersion?.title} (Copy)`,
        versionNumber: versionCount + 1,
        totalBudget: "0",
        totalImpressions: 0,
        avgCpm: "0",
        isActive: true,
      };
      
      const createdVersion = await apiRequest("POST", "/api/media-plan-versions", newVersion);
      
      // Copy all line items from current version
      const copyPromises = lineItems.map(async (item) => {
        const newItem = {
          mediaPlanVersionId: createdVersion.id,
          productId: item.productId,
          lineItemName: item.lineItemName,
          site: item.site,
          placementName: item.placementName,
          targetingDetails: item.targetingDetails || '',
          adSizes: item.adSizes || '',
          startDate: item.startDate,
          endDate: item.endDate,
          rateModel: item.rateModel,
          cpmRate: item.cpmRate,
          flatRate: item.flatRate,
          impressions: item.impressions,
          totalCost: item.totalCost,
          sortOrder: item.sortOrder
        };
        
        return apiRequest("POST", "/api/line-items", newItem);
      });
      
      await Promise.all(copyPromises);
      return createdVersion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/rfp-responses/${rfpResponse?.id}/media-plan-versions`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/rfp-responses'] 
      });
      toast({
        title: "Version Duplicated",
        description: "Media plan version has been duplicated with all line items.",
      });
    },
  });

  const deleteVersionMutation = useMutation({
    mutationFn: async (versionId: number) => {
      return apiRequest("DELETE", `/api/media-plan-versions/${versionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/rfp-responses/${rfpResponse?.id}/media-plan-versions`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/rfp-responses'] 
      });
      
      // Switch to first available version
      const remainingVersions = mediaPlanVersions.filter(v => v.id !== selectedVersionId);
      if (remainingVersions.length > 0) {
        onVersionChange(remainingVersions[0].id);
      }
      
      toast({
        title: "Version Deleted",
        description: "Media plan version has been deleted.",
      });
    },
  });

  const updateLineItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateMediaPlanLineItem }) => {
      return apiRequest("PUT", `/api/line-items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/media-plan-versions/${selectedVersionId}/line-items`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/rfp-responses/${rfpResponse?.id}/media-plan-versions`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/rfp-responses'] 
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
      queryClient.invalidateQueries({ 
        queryKey: [`/api/rfp-responses/${rfpResponse?.id}/media-plan-versions`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/rfp-responses'] 
      });
      toast({
        title: "Deleted",
        description: "Line item has been deleted.",
      });
    },
  });

  const duplicateLineItemMutation = useMutation({
    mutationFn: async (lineItem: MediaPlanLineItem) => {
      const duplicatedItem = {
        mediaPlanVersionId: lineItem.mediaPlanVersionId,
        productId: lineItem.productId,
        lineItemName: `${lineItem.lineItemName} (Copy)`,
        site: lineItem.site,
        placementName: lineItem.placementName ? `${lineItem.placementName} (Copy)` : `${lineItem.lineItemName} (Copy)`,
        targetingDetails: lineItem.targetingDetails || '',
        adSizes: lineItem.adSizes || '',
        startDate: lineItem.startDate,
        endDate: lineItem.endDate,
        rateModel: lineItem.rateModel,
        cpmRate: lineItem.cpmRate,
        flatRate: lineItem.flatRate,
        impressions: lineItem.impressions,
        totalCost: lineItem.totalCost,
        sortOrder: lineItem.sortOrder
      };
      
      return apiRequest("POST", "/api/line-items", duplicatedItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/media-plan-versions/${selectedVersionId}/line-items`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/rfp-responses/${rfpResponse?.id}/media-plan-versions`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/rfp-responses'] 
      });
      toast({
        title: "Duplicated",
        description: "Line item has been duplicated.",
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

  // Group YouTube package line items
  const groupLineItems = () => {
    const grouped: Array<{
      type: 'package' | 'individual';
      packageName?: string;
      productId?: number;
      sharedData?: {
        targetingDetails: string;
        startDate: string;
        endDate: string;
        rateModel: string;
        cpmRate: string;
        totalUnits: number;
        totalCost: string;
      };
      items: MediaPlanLineItem[];
    }> = [];

    // Group YouTube packages by package name
    const youtubePackages = new Map<string, MediaPlanLineItem[]>();
    const individualItems: MediaPlanLineItem[] = [];

    lineItems.forEach(item => {
      // Check if it's a YouTube package item by looking at the line item name pattern
      if (item.lineItemName.includes('YouTube') && item.lineItemName.includes(' - ')) {
        // Extract package name from line item name (e.g., "YouTube - Reach Package")
        const packageMatch = item.lineItemName.match(/^YouTube - (.+?) - /);
        if (packageMatch) {
          const packageType = packageMatch[1]; // e.g., "Reach Package"
          const packageName = `MiQ_YouTube_${packageType.replace(' ', '_')}`;
          
          if (!youtubePackages.has(packageName)) {
            youtubePackages.set(packageName, []);
          }
          youtubePackages.get(packageName)!.push(item);
        } else {
          // Fallback for other patterns
          individualItems.push(item);
        }
      } else {
        individualItems.push(item);
      }
    });

    // Add individual items first
    individualItems.forEach(item => {
      grouped.push({
        type: 'individual',
        items: [item]
      });
    });

    // Add grouped YouTube packages
    youtubePackages.forEach((packageItems, packageName) => {
      if (packageItems.length > 0) {
        const firstItem = packageItems[0];
        const totalUnits = packageItems.reduce((sum, item) => sum + item.impressions, 0);
        const totalCost = packageItems.reduce((sum, item) => sum + parseFloat(item.totalCost), 0);
        
        grouped.push({
          type: 'package',
          packageName,
          productId: firstItem.productId,
          sharedData: {
            targetingDetails: firstItem.targetingDetails || '',
            startDate: firstItem.startDate || '',
            endDate: firstItem.endDate || '',
            rateModel: firstItem.rateModel || 'dCPM',
            cpmRate: firstItem.cpmRate || '0',
            totalUnits,
            totalCost: totalCost.toFixed(2)
          },
          items: packageItems
        });
      }
    });

    return grouped;
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
    
    // Calculate total cost based on rate model
    if (field === 'cpmRate' || field === 'impressions' || field === 'rateModel') {
      const rate = parseFloat(updatedItem.cpmRate || '0');
      const units = updatedItem.impressions || 0;
      const rateModel = updatedItem.rateModel || 'CPM';
      
      let totalCost = 0;
      switch (rateModel) {
        case 'CPM':
        case 'dCPM':
          totalCost = (rate * units) / 1000;
          break;
        case 'CPCV':
        case 'CPC':
          totalCost = rate * units;
          break;
        default:
          totalCost = (rate * units) / 1000;
      }
      
      updatedItem.totalCost = totalCost.toFixed(2);
    }
    
    updateLineItemMutation.mutate({ id: lineItem.id, data: updatedItem });
  };

  // Format targeting details to separate notice from content
  const formatTargetingDetails = (targetingDetails: string | null) => {
    if (!targetingDetails) return { notice: '', content: '' };
    
    // Look for text between ** and **
    const noticeMatch = targetingDetails.match(/\*\*(.*?)\*\*/);
    if (noticeMatch) {
      const notice = noticeMatch[1];
      const content = targetingDetails.replace(/\*\*.*?\*\*\s*/, '').trim();
      return { notice, content };
    }
    
    return { notice: '', content: targetingDetails };
  };

  return (
    <div className="w-full">
      {/* Version Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Media Plan Versions</h3>
          <p className="text-sm text-gray-600">Manage different versions of your media plan</p>
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
            className="hover:bg-green-700 bg-[#7c33b6]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Version
          </Button>
          {mediaPlanVersions.length > 1 && (
            <Button
              onClick={() => deleteVersionMutation.mutate(selectedVersionId)}
              disabled={deleteVersionMutation.isPending}
              variant="outline"
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Version
            </Button>
          )}
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
                {editingLineItem === null && (
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Site
                  </TableHead>
                )}
                <TableHead className={`text-xs font-medium text-gray-500 uppercase tracking-wider ${editingLineItem !== null ? 'min-w-[300px]' : 'min-w-[180px]'}`}>
                  Placement Name
                </TableHead>
                {editingLineItem === null && (
                  <>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Targeting Details
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Ad Sizes
                    </TableHead>
                  </>
                )}
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Start Date
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  End Date
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Rate (Model)
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Rate ($)
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Units
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Cost ($)
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLineItemsLoading ? (
                <TableRow>
                  <TableCell colSpan={editingLineItem === null ? 11 : 7} className="text-center py-8 text-gray-500">
                    Loading line items...
                  </TableCell>
                </TableRow>
              ) : lineItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={editingLineItem === null ? 11 : 7} className="text-center py-8 text-gray-500">
                    No line items yet. Add products from the library to get started.
                  </TableCell>
                </TableRow>
              ) : (
                groupLineItems().flatMap((group, groupIndex) => {
                  if (group.type === 'package') {
                    return [
                      // Package header row
                      <TableRow key={`package-${groupIndex}`} className="bg-gray-50 border-b-2 border-gray-200">
                        {editingLineItem === null && (
                          <TableCell>
                            <span className="text-sm font-medium text-gray-900">MiQ</span>
                          </TableCell>
                        )}
                        <TableCell>
                          <span className="text-sm font-semibold text-gray-900">{group.packageName}</span>
                        </TableCell>
                        {editingLineItem === null && (
                          <>
                            <TableCell>
                              <div className="max-w-[200px] max-h-[80px] text-sm text-gray-600 leading-tight whitespace-normal pr-2 border border-gray-100 rounded p-2 overflow-y-auto table-cell-scroll">
                                {(() => {
                                  const formatted = formatTargetingDetails(group.sharedData?.targetingDetails);
                                  return (
                                    <div className="text-xs text-gray-700">
                                      {formatted.content || '-'}
                                    </div>
                                  );
                                })()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                                Package
                              </Badge>
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          <span className="text-sm text-gray-900">
                            {group.sharedData?.startDate 
                              ? new Date(group.sharedData.startDate).toLocaleDateString('en-US', { 
                                  month: '2-digit', 
                                  day: '2-digit', 
                                  year: '2-digit' 
                                }).replace(/\//g, '-')
                              : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">
                            {group.sharedData?.endDate 
                              ? new Date(group.sharedData.endDate).toLocaleDateString('en-US', { 
                                  month: '2-digit', 
                                  day: '2-digit', 
                                  year: '2-digit' 
                                }).replace(/\//g, '-')
                              : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {group.sharedData?.rateModel || 'dCPM'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">${group.sharedData?.cpmRate || '0'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">{group.sharedData?.totalUnits.toLocaleString() || '0'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold text-gray-900">${group.sharedData?.totalCost || '0'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // Toggle editing for the first item in package (this will enable editing for the whole package)
                                const firstItem = group.items[0];
                                if (firstItem) {
                                  setEditingLineItem(editingLineItem === firstItem.id ? null : firstItem.id);
                                }
                              }}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // Delete all items in package
                                group.items.forEach(item => deleteLineItemMutation.mutate(item.id));
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>,
                      // Package child rows
                      ...group.items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50 h-20 border-l-4 border-blue-200 bg-blue-50/30">
                          {editingLineItem === null && (
                            <TableCell>
                              <span className="text-sm text-gray-500 ml-4">↳</span>
                            </TableCell>
                          )}
                          <TableCell>
                            {editingLineItem === item.id ? (
                              <Input
                                value={item.placementName?.replace(/^MiQ_/, '') || item.lineItemName}
                                onChange={(e) => {
                                  const newName = e.target.value.startsWith('MiQ_') ? e.target.value : `MiQ_${e.target.value}`;
                                  handleLineItemUpdate(item, 'placementName', newName);
                                }}
                                className="w-full text-sm h-12 ml-4"
                                placeholder="Placement name"
                              />
                            ) : (
                              <span className="text-sm text-gray-700 ml-4">
                                {item.placementName?.replace(/^MiQ_/, '') || item.lineItemName}
                              </span>
                            )}
                          </TableCell>
                          {editingLineItem === null && (
                            <>
                              <TableCell>
                                <span className="text-sm text-gray-500">-</span>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm space-y-1">
                                  {item.adSizes && item.adSizes.split(',').map((size, index) => (
                                    <span key={index} className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded border mr-1">
                                      {size.trim()}
                                    </span>
                                  ))}
                                </div>
                              </TableCell>
                            </>
                          )}
                          {editingLineItem === item.id && (
                            <>
                              <TableCell>
                                <Input
                                  value={item.targetingDetails || ''}
                                  onChange={(e) => handleLineItemUpdate(item, 'targetingDetails', e.target.value)}
                                  className="w-full text-sm"
                                  placeholder="Targeting details"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.adSizes || ''}
                                  onChange={(e) => handleLineItemUpdate(item, 'adSizes', e.target.value)}
                                  className="w-full text-sm"
                                  placeholder="Ad sizes"
                                />
                              </TableCell>
                            </>
                          )}
                          {/* Start Date */}
                          <TableCell>
                            {editingLineItem === item.id ? (
                              <Input
                                type="date"
                                value={item.startDate || ''}
                                onChange={(e) => handleLineItemUpdate(item, 'startDate', e.target.value)}
                                className="w-full text-sm"
                              />
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </TableCell>
                          {/* End Date */}
                          <TableCell>
                            {editingLineItem === item.id ? (
                              <Input
                                type="date"
                                value={item.endDate || ''}
                                onChange={(e) => handleLineItemUpdate(item, 'endDate', e.target.value)}
                                className="w-full text-sm"
                              />
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </TableCell>
                          {/* Rate Model */}
                          <TableCell>
                            {editingLineItem === item.id ? (
                              <Select 
                                value={item.rateModel || 'dCPM'} 
                                onValueChange={(value) => handleLineItemUpdate(item, 'rateModel', value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CPM">CPM</SelectItem>
                                  <SelectItem value="dCPM">dCPM</SelectItem>
                                  <SelectItem value="CPCV">CPCV</SelectItem>
                                  <SelectItem value="CPC">CPC</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </TableCell>
                          {/* Rate ($) */}
                          <TableCell>
                            {editingLineItem === item.id ? (
                              <Input
                                type="number"
                                step="0.01"
                                value={item.cpmRate || ''}
                                onChange={(e) => handleLineItemUpdate(item, 'cpmRate', e.target.value)}
                                className="w-full text-sm"
                                placeholder="0.00"
                              />
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </TableCell>
                          {/* Units */}
                          <TableCell>
                            {editingLineItem === item.id ? (
                              <Input
                                type="number"
                                value={item.impressions || ''}
                                onChange={(e) => handleLineItemUpdate(item, 'impressions', parseInt(e.target.value) || 0)}
                                className="w-full text-sm"
                                placeholder="0"
                              />
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </TableCell>
                          {/* Cost ($) */}
                          <TableCell>
                            <span className="text-sm text-gray-500">-</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingLineItem(editingLineItem === item.id ? null : item.id)}
                                className="text-blue-500 hover:text-blue-700 px-2"
                              >
                                {editingLineItem === item.id ? (
                                  <>
                                    <span className="text-xs mr-1">Save</span>
                                  </>
                                ) : (
                                  <Edit className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => duplicateLineItemMutation.mutate(item)}
                                disabled={duplicateLineItemMutation.isPending}
                                className="text-green-500 hover:text-green-700 px-2"
                                title="Duplicate line item"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteLineItemMutation.mutate(item.id)}
                                disabled={deleteLineItemMutation.isPending}
                                className="text-red-500 hover:text-red-700 px-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ];
                  } else {
                    // Individual item row
                    const item = group.items[0];
                    const product = getProductById(item.productId);
                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50 h-20">
                        {/* Site - only show when not editing */}
                        {editingLineItem === null && (
                          <TableCell>
                            <span className="text-sm text-gray-900">MiQ</span>
                          </TableCell>
                        )}
                        {/* Placement Name - wider when editing */}
                        <TableCell>
                          {editingLineItem === item.id ? (
                            <Input
                              value={item.placementName || item.lineItemName}
                              onChange={(e) => handleLineItemUpdate(item, 'placementName', e.target.value)}
                              className="w-full text-sm h-12"
                              placeholder="Placement name"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{item.placementName || item.lineItemName}</span>
                          )}
                        </TableCell>
                        {/* Targeting Details - only show when not editing */}
                        {editingLineItem === null && (
                          <TableCell>
                            <div className="max-w-[200px] max-h-[80px] text-sm text-gray-600 leading-tight whitespace-normal pr-2 border border-gray-100 rounded p-2 overflow-y-auto table-cell-scroll">
                              {(() => {
                                const formatted = formatTargetingDetails(item.targetingDetails || product?.targetingDetails);
                                return (
                                  <div className="text-xs text-gray-700">
                                    {formatted.content || '-'}
                                  </div>
                                );
                              })()}
                            </div>
                          </TableCell>
                        )}
                        {/* Ad Sizes - only show when not editing */}
                        {editingLineItem === null && (
                          <TableCell>
                            <div className="text-sm space-y-1.5 min-w-[150px] max-h-[80px] overflow-y-auto table-cell-scroll">
                              {(() => {
                                const adSizesText = item.adSizes || product?.adSizes || '-';
                                
                                // Check if it contains platform-specific formatting (Desktop:, Tablet:, Mobile:)
                                if (adSizesText.includes('Desktop:') || adSizesText.includes('Tablet:') || adSizesText.includes('Mobile:')) {
                                  // Handle platform-specific ad sizes
                                  return adSizesText.split(/(?=Desktop:|Tablet:|Mobile:)/g).filter(Boolean).map((platformGroup, index) => {
                                    const trimmed = platformGroup.trim();
                                    const colonIndex = trimmed.indexOf(':');
                                    if (colonIndex === -1) return null;
                                    
                                    const platform = trimmed.substring(0, colonIndex);
                                    const sizesText = trimmed.substring(colonIndex + 1).trim();
                                    const sizes = sizesText.split(',').map(s => s.trim()).filter(Boolean);
                                    
                                    return (
                                      <div key={index} className="space-y-1">
                                        <div className="font-semibold text-gray-900 text-xs">
                                          {platform}:
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {sizes.map((size, sizeIndex) => (
                                            <span 
                                              key={sizeIndex}
                                              className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded border"
                                            >
                                              {size}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  });
                                } else {
                                  // Handle non-platform-specific ad sizes (like audio/video durations)
                                  const sizes = adSizesText.split(',').map(s => s.trim()).filter(Boolean);
                                  return (
                                    <div className="flex flex-wrap gap-1">
                                      {sizes.map((size, sizeIndex) => (
                                        <span 
                                          key={sizeIndex}
                                          className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded border"
                                        >
                                          {size}
                                        </span>
                                      ))}
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </TableCell>
                        )}
                        {/* Start Date */}
                        <TableCell>
                          {editingLineItem === item.id ? (
                            <Input
                              type="date"
                              value={item.startDate || ''}
                              onChange={(e) => handleLineItemUpdate(item, 'startDate', e.target.value)}
                              className="w-full text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">
                              {item.startDate 
                                ? new Date(item.startDate).toLocaleDateString('en-US', { 
                                    month: '2-digit', 
                                    day: '2-digit', 
                                    year: '2-digit' 
                                  }).replace(/\//g, '-')
                                : '-'}
                            </span>
                          )}
                        </TableCell>
                        {/* End Date */}
                        <TableCell>
                          {editingLineItem === item.id ? (
                            <Input
                              type="date"
                              value={item.endDate || ''}
                              onChange={(e) => handleLineItemUpdate(item, 'endDate', e.target.value)}
                              className="w-full text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">
                              {item.endDate 
                                ? new Date(item.endDate).toLocaleDateString('en-US', { 
                                    month: '2-digit', 
                                    day: '2-digit', 
                                    year: '2-digit' 
                                  }).replace(/\//g, '-')
                                : '-'}
                            </span>
                          )}
                        </TableCell>
                        {/* Rate Model */}
                        <TableCell>
                          {editingLineItem === item.id ? (
                            <Select 
                              value={item.rateModel || 'CPM'} 
                              onValueChange={(value) => handleLineItemUpdate(item, 'rateModel', value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CPM">CPM</SelectItem>
                                <SelectItem value="dCPM">dCPM</SelectItem>
                                <SelectItem value="CPCV">CPCV</SelectItem>
                                <SelectItem value="CPC">CPC</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {item.rateModel || 'CPM'}
                            </Badge>
                          )}
                        </TableCell>
                        {/* Rate ($) */}
                        <TableCell>
                          {editingLineItem === item.id ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={item.cpmRate || ''}
                              onChange={(e) => handleLineItemUpdate(item, 'cpmRate', e.target.value)}
                              className="w-full text-sm"
                              placeholder="0.00"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">${item.cpmRate || '0.00'}</span>
                          )}
                        </TableCell>
                        {/* Units */}
                        <TableCell>
                          {editingLineItem === item.id ? (
                            <Input
                              type="number"
                              value={item.impressions || ''}
                              onChange={(e) => handleLineItemUpdate(item, 'impressions', parseInt(e.target.value) || 0)}
                              className="w-full text-sm"
                              placeholder="0"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{item.impressions.toLocaleString()}</span>
                          )}
                        </TableCell>
                        {/* Cost ($) */}
                        <TableCell>
                          <span className="text-sm font-semibold text-gray-900">${parseFloat(item.totalCost).toFixed(2)}</span>
                        </TableCell>
                        {/* Actions */}
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingLineItem(editingLineItem === item.id ? null : item.id)}
                              className="text-blue-500 hover:text-blue-700 px-2"
                            >
                              {editingLineItem === item.id ? (
                                <>
                                  <span className="text-xs mr-1">Save</span>
                                </>
                              ) : (
                                <Edit className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => duplicateLineItemMutation.mutate(item)}
                              disabled={duplicateLineItemMutation.isPending}
                              className="text-green-500 hover:text-green-700 px-2"
                              title="Duplicate line item"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteLineItemMutation.mutate(item.id)}
                              disabled={deleteLineItemMutation.isPending}
                              className="text-red-500 hover:text-red-700 px-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }
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
              <Button 
                variant="outline" 
                onClick={() => duplicateVersionMutation.mutate()}
                disabled={duplicateVersionMutation.isPending || lineItems.length === 0}
                className="text-gray-700 hover:bg-gray-200"
              >
                <Copy className="w-4 h-4 mr-2" />
                {duplicateVersionMutation.isPending ? "Duplicating..." : "Duplicate Plan"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}