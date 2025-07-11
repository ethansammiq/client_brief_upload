import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, DollarSign, Target, Users, Edit, Trash2, FileText, BarChart3 } from "lucide-react";
import RfpForm from "@/components/rfp-form";
import type { RfpResponse, MediaPlanVersion, MediaPlanLineItem } from "@shared/schema";

interface MediaPlansLibraryProps {
  onSelectPlan: (planId: number) => void;
}

// Custom hook to fetch media plan versions and line items for each RFP
const useMediaPlanDetails = (rfpResponseId: number) => {
  const { data: versions = [] } = useQuery<MediaPlanVersion[]>({
    queryKey: ['/api/rfp-responses', rfpResponseId, 'media-plan-versions'],
    queryFn: async () => {
      const response = await fetch(`/api/rfp-responses/${rfpResponseId}/media-plan-versions`);
      if (!response.ok) throw new Error('Failed to fetch media plan versions');
      return response.json();
    },
    enabled: !!rfpResponseId,
  });

  const { data: lineItemCounts = {} } = useQuery<Record<number, number>>({
    queryKey: ['/api/rfp-responses', rfpResponseId, 'line-item-counts'],
    queryFn: async () => {
      const counts: Record<number, number> = {};
      for (const version of versions) {
        const response = await fetch(`/api/media-plan-versions/${version.id}/line-items`);
        if (response.ok) {
          const lineItems: MediaPlanLineItem[] = await response.json();
          counts[version.id] = lineItems.length;
        }
      }
      return counts;
    },
    enabled: versions.length > 0,
  });

  return { versions, lineItemCounts };
};

// Component to display individual media plan card with variation details
interface MediaPlanCardProps {
  plan: RfpResponse;
  onSelectPlan: (planId: number) => void;
}

function MediaPlanCard({ plan, onSelectPlan }: MediaPlanCardProps) {
  const { versions, lineItemCounts } = useMediaPlanDetails(plan.id);
  
  const getStatusColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'bg-red-100 text-red-800';
    if (daysUntilDue <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'Overdue';
    if (daysUntilDue === 0) return 'Due Today';
    if (daysUntilDue <= 7) return `Due in ${daysUntilDue} days`;
    return 'On Track';
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {plan.title}
            </CardTitle>
            <CardDescription className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              {plan.clientName}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(plan.dueDate)}>
            {getStatusText(plan.dueDate)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {plan.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {plan.description}
            </p>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            Due: {new Date(plan.dueDate).toLocaleDateString()}
          </div>

          {plan.objectives && (
            <div className="flex items-start">
              <Target className="w-4 h-4 mr-1 mt-0.5 text-gray-400" />
              <p className="text-xs text-gray-500 line-clamp-2">
                {plan.objectives}
              </p>
            </div>
          )}

          {/* Plan Variations Section */}
          {versions.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center mb-2">
                <FileText className="w-4 h-4 mr-1 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Plan Variations</span>
              </div>
              <div className="space-y-1">
                {versions.map((version) => (
                  <div key={version.id} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    <div className="flex items-center">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      <span>{version.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">{lineItemCounts[version.id] || 0} LI</span>
                      <span className="text-green-600">{formatCurrency(version.totalBudget)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              onClick={() => onSelectPlan(plan.id)}
              className="flex-1 mr-2 hover:bg-blue-700 bg-[#7c33b6]"
            >
              Open Plan
            </Button>
            <div className="flex space-x-1">
              <RfpForm rfpResponse={plan}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </RfpForm>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MediaPlansLibrary({ onSelectPlan }: MediaPlansLibraryProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: rfpResponses = [] } = useQuery<RfpResponse[]>({
    queryKey: ['/api/rfp-responses'],
  });

  const handleCreateSuccess = (newPlan: RfpResponse) => {
    setShowCreateForm(false);
    onSelectPlan(newPlan.id);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Media Plans Library</h2>
          <p className="text-gray-600 mt-1">Browse and manage your media planning campaigns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Plan Card */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer group">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start New Plan</h3>
            <p className="text-sm text-gray-600 mb-4">Create a new media planning campaign</p>
            <RfpForm onSuccess={handleCreateSuccess} />
          </CardContent>
        </Card>

        {/* Existing Plans */}
        {rfpResponses.map((plan) => (
          <MediaPlanCard key={plan.id} plan={plan} onSelectPlan={onSelectPlan} />
        ))}
      </div>

      {rfpResponses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Media Plans Yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first media planning campaign</p>
          <RfpForm onSuccess={handleCreateSuccess} />
        </div>
      )}
    </div>
  );
}