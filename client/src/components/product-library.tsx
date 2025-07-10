import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Plus, Eye, Edit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, InsertMediaPlanLineItem } from "@shared/schema";

interface ProductLibraryProps {
  selectedVersionId: number;
}

export default function ProductLibrary({ selectedVersionId }: ProductLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', { search: searchQuery, category: selectedCategory }],
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['/api/categories'],
  });

  const addToMediaPlanMutation = useMutation({
    mutationFn: async (product: Product) => {
      const lineItem: InsertMediaPlanLineItem = {
        mediaPlanVersionId: selectedVersionId,
        productId: product.id,
        lineItemName: product.placementName,
        cpmRate: "25.00",
        impressions: 1000000,
        totalCost: "25000",
        sortOrder: 0,
      };
      
      return apiRequest("POST", "/api/line-items", lineItem);
    },
    onSuccess: () => {
      // Invalidate the line items query with the correct key
      queryClient.invalidateQueries({ 
        queryKey: [`/api/media-plan-versions/${selectedVersionId}/line-items`] 
      });
      toast({
        title: "Product Added",
        description: "Product has been added to your media plan.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to media plan.",
        variant: "destructive",
      });
    },
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'Display': 'bg-blue-100 text-blue-800',
      'Video': 'bg-purple-100 text-purple-800',
      'Audio': 'bg-yellow-100 text-yellow-800',
      'Social': 'bg-pink-100 text-pink-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-text mb-4">Product Library</h3>
        
        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Categories">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {productsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No products found</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-text text-sm">{product.name}</h4>
                  <Badge
                    variant="secondary"
                    className={`text-xs mt-1 ${getCategoryColor(product.category)}`}
                  >
                    {product.category}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => addToMediaPlanMutation.mutate(product)}
                  disabled={addToMediaPlanMutation.isPending}
                  className="text-primary hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-xs text-gray-600 mb-2">
                <strong>Targeting:</strong> {truncateText(product.targetingDetails, 100)}
              </div>
              
              <div className="text-xs text-gray-600 mb-2">
                <strong>Placement:</strong> {truncateText(product.placementName, 60)}
              </div>
              
              <div className="text-xs text-gray-600 mb-2">
                <strong>Ad Sizes:</strong> {truncateText(product.adSizes, 80)}
              </div>
              
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-xs font-medium text-secondary">
                  {product.pricingModel}
                </Badge>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
