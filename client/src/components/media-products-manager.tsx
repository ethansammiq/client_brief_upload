import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Search, Package, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, InsertProduct } from "@shared/schema";

export default function MediaProductsManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/categories"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (product: InsertProduct) => {
      return apiRequest("POST", "/api/products", product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Product Created",
        description: "New product has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, product }: { id: number; product: Partial<InsertProduct> }) => {
      return apiRequest("PUT", `/api/products/${id}`, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      toast({
        title: "Product Updated",
        description: "Product has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.placementName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'Display': 'bg-blue-100 text-blue-800',
      'Video': 'bg-purple-100 text-purple-800',
      'Audio': 'bg-yellow-100 text-yellow-800',
      'Social': 'bg-pink-100 text-pink-800',
      'YouTube': 'bg-red-100 text-red-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: "name" as keyof Product,
      label: "Product Name",
      render: (value: any, row: Product) => (
        <div className="flex items-center gap-2">
          {row.isPackage && <Package className="w-4 h-4 text-blue-500" />}
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: "category" as keyof Product,
      label: "Category",
      render: (value: any) => (
        <Badge variant="secondary" className={getCategoryColor(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: "isPackage" as keyof Product,
      label: "Type",
      render: (value: any) => (
        <Badge variant={value ? "default" : "outline"} className={value ? "bg-blue-100 text-blue-800" : ""}>
          {value ? "Package" : "Product"}
        </Badge>
      )
    },
    {
      key: "placementName" as keyof Product,
      label: "Placement Name",
      render: (value: any) => <span className="text-sm">{value}</span>
    },
    {
      key: "pricingModel" as keyof Product,
      label: "Pricing Model",
      render: (value: any) => <Badge variant="outline">{value}</Badge>
    },
    {
      key: "id" as keyof Product,
      label: "Actions",
      render: (value: any, row: Product) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingProduct(row)}
            className="text-primary hover:text-blue-700"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => deleteProductMutation.mutate(row.id)}
            disabled={deleteProductMutation.isPending}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const ProductForm = ({ product, onSubmit, onCancel }: {
    product?: Product | null;
    onSubmit: (data: InsertProduct) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<InsertProduct>({
      name: product?.name || "",
      category: product?.category || "Display",
      placementName: product?.placementName || "",
      targetingDetails: product?.targetingDetails || "",
      adSizes: product?.adSizes || "",
      pricingModel: product?.pricingModel || "CPM",
      isPackage: product?.isPackage || false,
      packagePlacements: product?.packagePlacements || null,
    });

    const [placements, setPlacements] = useState<Array<{name: string; adSizes: string; targeting: string}>>(() => {
      if (product?.packagePlacements) {
        try {
          return JSON.parse(product.packagePlacements);
        } catch {
          return [];
        }
      }
      return [];
    });

    const [newPlacement, setNewPlacement] = useState({
      name: "",
      adSizes: "",
      targeting: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const submitData = {
        ...formData,
        packagePlacements: formData.isPackage ? JSON.stringify(placements) : null,
      };
      onSubmit(submitData);
    };

    const addPlacement = () => {
      if (newPlacement.name && newPlacement.adSizes) {
        setPlacements([...placements, { ...newPlacement }]);
        setNewPlacement({ name: "", adSizes: "", targeting: "" });
      }
    };

    const removePlacement = (index: number) => {
      setPlacements(placements.filter((_, i) => i !== index));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Display">Display</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="Audio">Audio</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Package Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="isPackage"
            checked={formData.isPackage}
            onCheckedChange={(checked) => setFormData({ ...formData, isPackage: checked })}
          />
          <Label htmlFor="isPackage">This is a package product</Label>
        </div>
        
        {!formData.isPackage && (
          <div>
            <Label htmlFor="placementName">Placement Name</Label>
            <Input
              id="placementName"
              value={formData.placementName}
              onChange={(e) => setFormData({ ...formData, placementName: e.target.value })}
              required
            />
          </div>
        )}

        <div>
          <Label htmlFor="targetingDetails">Targeting Details</Label>
          <Textarea
            id="targetingDetails"
            value={formData.targetingDetails}
            onChange={(e) => setFormData({ ...formData, targetingDetails: e.target.value })}
            rows={4}
            placeholder="Use **text** for notice sections that will be highlighted in package modals"
          />
        </div>

        {!formData.isPackage && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adSizes">Ad Sizes</Label>
              <Input
                id="adSizes"
                value={formData.adSizes}
                onChange={(e) => setFormData({ ...formData, adSizes: e.target.value })}
                placeholder="e.g., 300x250, 728x90"
              />
            </div>
            <div>
              <Label htmlFor="pricingModel">Pricing Model</Label>
              <Select value={formData.pricingModel} onValueChange={(value) => setFormData({ ...formData, pricingModel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CPM">CPM</SelectItem>
                  <SelectItem value="CPC">CPC</SelectItem>
                  <SelectItem value="CPA">CPA</SelectItem>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Package Placements Management */}
        {formData.isPackage && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Package Placements</Label>
              <p className="text-sm text-gray-600">Add individual placements that will be included in this package</p>
            </div>

            {/* Add New Placement */}
            <div className="border rounded-lg p-4 space-y-3">
              <Label className="text-sm font-medium">Add New Placement</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="newPlacementName" className="text-xs">Placement Name</Label>
                  <Input
                    id="newPlacementName"
                    value={newPlacement.name}
                    onChange={(e) => setNewPlacement({ ...newPlacement, name: e.target.value })}
                    placeholder="e.g., MiQ_YT_Skippable In-Stream"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="newPlacementAdSizes" className="text-xs">Ad Sizes</Label>
                  <Input
                    id="newPlacementAdSizes"
                    value={newPlacement.adSizes}
                    onChange={(e) => setNewPlacement({ ...newPlacement, adSizes: e.target.value })}
                    placeholder="e.g., :15s, :30s"
                    className="text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="newPlacementTargeting" className="text-xs">Targeting (Optional)</Label>
                <Input
                  id="newPlacementTargeting"
                  value={newPlacement.targeting}
                  onChange={(e) => setNewPlacement({ ...newPlacement, targeting: e.target.value })}
                  placeholder="Placement-specific targeting details"
                  className="text-sm"
                />
              </div>
              <Button type="button" onClick={addPlacement} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Placement
              </Button>
            </div>

            {/* Existing Placements */}
            {placements.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Package Placements ({placements.length})</Label>
                {placements.map((placement, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{placement.name}</div>
                      <div className="text-xs text-gray-600">{placement.adSizes}</div>
                      {placement.targeting && (
                        <div className="text-xs text-gray-500 mt-1">{placement.targeting}</div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlacement(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
            {product ? "Update" : "Create"} {formData.isPackage ? "Package" : "Product"}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="p-6 space-y-6 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">Media Products</h2>
          <p className="text-gray-500">Manage your available advertising products and placements</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={(data) => createProductMutation.mutate(data)}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredProducts}
            columns={columns}
            searchable={false}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSubmit={(data) => editingProduct && updateProductMutation.mutate({ id: editingProduct.id, product: data })}
            onCancel={() => setEditingProduct(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}