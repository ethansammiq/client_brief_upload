import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/top-navigation";
import ProductLibrary from "@/components/product-library";
import MediaPlanBuilder from "@/components/media-plan-builder";
import { Button } from "@/components/ui/button";
import { Download, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RfpResponse, MediaPlanVersion } from "@shared/schema";

export default function Dashboard() {
  const [selectedRfpId, setSelectedRfpId] = useState<number>(1);
  const [selectedVersionId, setSelectedVersionId] = useState<number>(1);
  const { toast } = useToast();

  const { data: rfpResponses = [] } = useQuery<RfpResponse[]>({
    queryKey: ['/api/rfp-responses'],
  });

  const { data: currentRfp } = useQuery<RfpResponse>({
    queryKey: ['/api/rfp-responses', selectedRfpId],
    enabled: !!selectedRfpId,
  });

  const { data: mediaPlanVersions = [] } = useQuery<MediaPlanVersion[]>({
    queryKey: ['/api/rfp-responses', selectedRfpId, 'media-plan-versions'],
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
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text">RFP Response Builder</h2>
              <p className="text-sm text-gray-500">Create comprehensive media plans for client proposals</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleExportPlan}
                className="text-gray-700 hover:bg-gray-100"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Plan
              </Button>
              <Button 
                onClick={handleSaveRfp}
                className="bg-primary hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save RFP
              </Button>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            <ProductLibrary 
              selectedVersionId={selectedVersionId}
            />
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
  );
}
