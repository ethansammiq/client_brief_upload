import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/top-navigation";
import SubNavigation from "@/components/sub-navigation";
import ProductLibrary from "@/components/product-library";
import MediaPlanBuilder from "@/components/media-plan-builder";
import MediaProductsManager from "@/components/media-products-manager";
import MediaPlansLibrary from "@/components/media-plans-library";
import { Button } from "@/components/ui/button";
import { Download, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RfpResponse, MediaPlanVersion } from "@shared/schema";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("media-planner");
  const [selectedRfpId, setSelectedRfpId] = useState<number | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<number>(1);
  const [showBuilder, setShowBuilder] = useState(false);
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

  // Auto-select first available version when versions are loaded
  useEffect(() => {
    if (mediaPlanVersions.length > 0 && !mediaPlanVersions.find(v => v.id === selectedVersionId)) {
      setSelectedVersionId(mediaPlanVersions[0].id);
    }
  }, [mediaPlanVersions, selectedVersionId]);

  const handleSelectPlan = (planId: number) => {
    setSelectedRfpId(planId);
    setShowBuilder(true);
    // Version will be auto-selected by useEffect above
  };

  const handleBackToLibrary = () => {
    setShowBuilder(false);
    setSelectedRfpId(null);
  };

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
            {!showBuilder ? (
              /* Media Plans Library */
              (<div className="bg-gray-50 min-h-full">
                <div className="max-w-7xl mx-auto px-6 py-6">
                  <MediaPlansLibrary onSelectPlan={handleSelectPlan} />
                </div>
              </div>)
            ) : (
              /* Media Plan Builder */
              (<>
                {/* Campaign Title Header */}
                <div className="text-white px-6 py-6 bg-[#2B0030]">
                  <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                      <div className="text-[#2b0030]">
                        <h1 className="text-3xl font-bold mb-2">
                          {currentRfp?.title || "Media Plan Builder"}
                        </h1>
                        <div className="flex items-center space-x-6 text-gray-300">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-[#2b0030]">Client:</span>
                            <span className="ml-2 text-[#2b0030]">{currentRfp?.clientName || "Not specified"}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">Due Date:</span>
                            <span className="ml-2 text-white">{currentRfp?.dueDate || "Not specified"}</span>
                          </div>
                          {currentRfp?.budget && (
                            <div className="flex items-center">
                              <span className="text-sm font-medium">Budget:</span>
                              <span className="ml-2 text-white">${currentRfp.budget.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleBackToLibrary}
                        className="border-gray-600 hover:bg-gray-800 hover:text-white text-[#111827]"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Library
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
                    
                    {/* Bottom Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Ready to finalize your media plan?
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
                            Save Campaign
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>)
            )}
          </div>
        )}

        {activeTab === "media-products" && (
          <MediaProductsManager />
        )}
      </div>
    </div>
  );
}
