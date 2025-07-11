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
import AddProductModal from "@/components/add-product-modal";
import type { Product, InsertMediaPlanLineItem } from "@shared/schema";

interface ProductLibraryProps {
  selectedVersionId: number;
  campaignStartDate?: string;
  campaignEndDate?: string;
}

export default function ProductLibrary({ selectedVersionId, campaignStartDate, campaignEndDate }: ProductLibraryProps) {
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

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.placementName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.targetingDetails.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All Categories" || 
                           product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });



  return (
    <div className="w-full">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-48">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
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
        </div>
      </div>

      {/* Products Horizontal Scroll */}
      {productsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Search className="w-8 h-8 mx-auto" />
          </div>
          <p className="text-gray-500">No products found matching your criteria</p>
        </div>
      ) : (
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-4 min-w-[300px] flex-shrink-0"

              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                    <Badge variant="secondary" className={`${getCategoryColor(product.category)} text-xs`}>
                      {product.category}
                    </Badge>
                  </div>
                  <AddProductModal 
                    product={product} 
                    selectedVersionId={selectedVersionId}
                    campaignStartDate={campaignStartDate}
                    campaignEndDate={campaignEndDate}
                  >
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </AddProductModal>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Targeting:</span> {truncateText(product.targetingDetails, 60)}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Placement:</span> {truncateText(product.placementName, 40)}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Ad Sizes:</span> {truncateText(product.adSizes, 40)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-medium text-gray-600">
                    {product.pricingModel}
                  </Badge>
                  <span className="text-xs text-blue-600 font-medium">Click to add</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 text-gray-400 text-xs">
            <div className="flex items-center space-x-1">
              <span>Scroll</span>
              <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
                <span className="text-xs">→</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
