import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/top-navigation";
import SubNavigation from "@/components/sub-navigation";
import ProductLibrary from "@/components/product-library";
import MediaPlanBuilder from "@/components/media-plan-builder";
import MediaProductsManager from "@/components/media-products-manager";
import RfpForm from "@/components/rfp-form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RfpResponse, MediaPlanVersion } from "@shared/schema";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("media-planner");
  const [selectedRfpId, setSelectedRfpId] = useState<number>(1);
  const [selectedVersionId, setSelectedVersionId] = useState<number>(1);
  const { toast } = useToast();

  const { data: rfpResponses = [] } = useQuery<RfpResponse[]>({
    queryKey: ['/api/rfp-responses'],
  });

  const { data: currentRfp } = useQuery<RfpResponse>({
    queryKey: [`/api/rfp-responses/${selectedRfpId}`],
    enabled: !!selectedRfpId,
  });

  const { data: mediaPlanVersions = [] } = useQuery<MediaPlanVersion[]>({
    queryKey: [`/api/rfp-responses/${selectedRfpId}/media-plan-versions`],
    enabled: !!selectedRfpId,
  });

  const handleExportPlan = () => {
    toast({
      title: "Export Started",
      description: "Your media plan is being exported...",
    });
  };

  const handleSaveRfp = () => {
    toast({
      title: "Saved",
      description: "RFP response has been saved successfully.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <SubNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "media-planner" && (
          <div className="flex-1 overflow-auto">
            

            {/* Campaign Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Media Plan Builder</h1>
                    <p className="text-gray-600 mt-1">Create comprehensive media plans for client proposals</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Select value={selectedRfpId.toString()} onValueChange={(value) => setSelectedRfpId(parseInt(value))}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {rfpResponses.map((rfp) => (
                          <SelectItem key={rfp.id} value={rfp.id.toString()}>
                            {rfp.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <RfpForm />
                    {currentRfp && <RfpForm rfpResponse={currentRfp} />}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleExportPlan}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Plan
                  </Button>
                  <Button 
                    onClick={handleSaveRfp}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save RFP
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-gray-50 min-h-full">
              <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                {/* Product Catalog Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Product Catalog</h2>
                    <p className="text-sm text-gray-600 mt-1">Browse and add products to your media plan</p>
                  </div>
                  <div className="p-6">
                    <ProductLibrary 
                      selectedVersionId={selectedVersionId}
                    />
                  </div>
                </div>

                {/* Media Plan Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Media Plan</h2>
                    <p className="text-sm text-gray-600 mt-1">Configure your campaign line items and budgets</p>
                  </div>
                  <div className="p-6">
                    <MediaPlanBuilder
                      rfpResponse={currentRfp}
                      mediaPlanVersions={mediaPlanVersions}
                      selectedVersionId={selectedVersionId}
                      onVersionChange={setSelectedVersionId}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "media-products" && (
          <MediaProductsManager />
        )}
      </div>
    </div>
  );
}
