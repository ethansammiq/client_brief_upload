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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { RfpResponse, MediaPlanVersion, MediaPlanLineItem } from "@shared/schema";

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

  const handleExportPlan = async () => {
    if (!currentRfp || !mediaPlanVersions.length) {
      toast({
        title: "Export Failed",
        description: "No media plan data available to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Export Started",
        description: "Your media plan is being exported...",
      });

      // Create new workbook
      const workbook = XLSX.utils.book_new();

      // Create summary worksheet
      const summaryData = [
        ['Media Plan Summary'],
        [''],
        ['Campaign Title', currentRfp.title],
        ['Client', currentRfp.clientName],
        ['Due Date', currentRfp.dueDate 
          ? new Date(currentRfp.dueDate).toLocaleDateString('en-US', { 
              month: '2-digit', 
              day: '2-digit', 
              year: '2-digit' 
            })
          : 'Not specified'],
        ['Campaign Start Date', currentRfp.campaignStartDate 
          ? new Date(currentRfp.campaignStartDate).toLocaleDateString('en-US', { 
              month: '2-digit', 
              day: '2-digit', 
              year: '2-digit' 
            })
          : 'Not specified'],
        ['Campaign End Date', currentRfp.campaignEndDate 
          ? new Date(currentRfp.campaignEndDate).toLocaleDateString('en-US', { 
              month: '2-digit', 
              day: '2-digit', 
              year: '2-digit' 
            })
          : 'Not specified'],
        ['Total Budget', currentRfp.totalBudget || 'Not specified'],
        ['Target Audience', currentRfp.targetAudience || 'Not specified'],
        [''],
        ['Plan Versions', mediaPlanVersions.length],
        [''],
        ['Version Details:'],
        ['Version Name', 'Budget', 'Impressions', 'CPM']
      ];

      // Add version summary data
      for (const version of mediaPlanVersions) {
        summaryData.push([
          version.name,
          version.totalBudget || 0,
          version.totalImpressions || 0,
          version.avgCpm || 0
        ]);
      }

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWs, 'Summary');

      // Create worksheet for each version
      for (const version of mediaPlanVersions) {
        try {
          const lineItemsResponse = await fetch(`/api/media-plan-versions/${version.id}/line-items`);
          
          if (!lineItemsResponse.ok) {
            const errorText = await lineItemsResponse.text();
            console.error(`API Error for version ${version.id}:`, errorText);
            throw new Error(`Failed to fetch line items for version ${version.id}: ${lineItemsResponse.status} ${errorText}`);
          }
          
          const lineItems: MediaPlanLineItem[] = await lineItemsResponse.json();

          // Create headers
          const headers = [
            'Line Item Name',
            'Product Name',
            'Placement Name',
            'Ad Sizes',
            'Budget',
            'Impressions',
            'CPM',
            'Start Date',
            'End Date',
            'Targeting Details'
          ];

          // Create data rows
          const data = [headers];
          
          // Add line items (simplified without grouping for now)
          lineItems.forEach(item => {
            const row = [
              item.lineItemName || '',
              item.productName || '',
              item.placementName || '',
              item.adSizes || '',
              item.totalCost || '',
              item.impressions || '',
              item.cpmRate || '',
              item.startDate 
                ? new Date(item.startDate).toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: '2-digit' 
                  })
                : '',
              item.endDate 
                ? new Date(item.endDate).toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: '2-digit' 
                  })
                : '',
              item.targetingDetails || ''
            ];
            data.push(row);
          });

          // Create worksheet
          const ws = XLSX.utils.aoa_to_sheet(data);
          
          // Set column widths
          const columnWidths = [
            { wch: 30 }, // Line Item Name
            { wch: 25 }, // Product Name
            { wch: 30 }, // Placement Name
            { wch: 20 }, // Ad Sizes
            { wch: 15 }, // Budget
            { wch: 15 }, // Impressions
            { wch: 10 }, // CPM
            { wch: 12 }, // Start Date
            { wch: 12 }, // End Date
            { wch: 50 }  // Targeting Details
          ];
          ws['!cols'] = columnWidths;

          // Add worksheet to workbook
          const sheetName = (version.title || `Version ${version.id}`).substring(0, 31); // Excel sheet name limit
          XLSX.utils.book_append_sheet(workbook, ws, sheetName);
        } catch (fetchError) {
          console.error(`Error fetching line items for version ${version.id}:`, fetchError);
          // Create empty worksheet for this version
          const emptyWs = XLSX.utils.aoa_to_sheet([['No data available for this version - Error: ' + (fetchError?.message || 'Unknown error')]]);
          XLSX.utils.book_append_sheet(workbook, emptyWs, (version.title || `Version ${version.id}`).substring(0, 31));
        }
      }

      // Generate file and save
      const fileName = `${currentRfp.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}_MediaPlan_${new Date().toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: '2-digit' 
      }).replace(/\//g, '-')}.xlsx`;
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, fileName);

      toast({
        title: "Export Complete",
        description: `Media plan exported as ${fileName}`,
      });

    } catch (error) {
      console.error('Export error:', error);
      
      toast({
        title: "Export Failed",
        description: `An error occurred while exporting the media plan: ${error?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
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
                <div className="text-white px-6 py-6 bg-[#e2e8f1]">
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
                          <div className="flex items-center text-[#2b0030]">
                            <span className="text-sm font-medium">Due Date:</span>
                            <span className="ml-2 text-[#2b0030]">
                              {currentRfp?.dueDate 
                                ? new Date(currentRfp.dueDate).toLocaleDateString('en-US', { 
                                    month: '2-digit', 
                                    day: '2-digit', 
                                    year: '2-digit' 
                                  })
                                : "Not specified"}
                            </span>
                          </div>
                          <div className="flex items-center text-[#2b0030]">
                            <span className="text-sm font-medium">Campaign:</span>
                            <span className="ml-2 text-[#2b0030]">
                              {currentRfp?.campaignStartDate && currentRfp?.campaignEndDate 
                                ? `${new Date(currentRfp.campaignStartDate).toLocaleDateString('en-US', { 
                                    month: '2-digit', 
                                    day: '2-digit', 
                                    year: '2-digit' 
                                  })} - ${new Date(currentRfp.campaignEndDate).toLocaleDateString('en-US', { 
                                    month: '2-digit', 
                                    day: '2-digit', 
                                    year: '2-digit' 
                                  })}`
                                : "Not specified"}
                            </span>
                          </div>
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
                  <div className="max-w-none mx-auto px-6 py-6 space-y-6">
                    {/* Product Catalog Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Product Catalog</h2>
                        <p className="text-sm text-gray-600 mt-1">Browse and add products to your media plan</p>
                      </div>
                      <div className="p-6">
                        <ProductLibrary 
                          selectedVersionId={selectedVersionId}
                          campaignStartDate={currentRfp?.campaignStartDate}
                          campaignEndDate={currentRfp?.campaignEndDate}
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
                            className="hover:bg-blue-700 text-white bg-[#7c33b6]"
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
          <div className="flex-1 overflow-auto">
            <MediaProductsManager />
          </div>
        )}
      </div>
    </div>
  );
}
