import { Button } from "@/components/ui/button";

interface SubNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function SubNavigation({ activeTab, onTabChange }: SubNavigationProps) {
  const tabs = [
    { id: "media-planner", label: "Media Planner" },
    { id: "media-products", label: "Media Products" }
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-3">
        <div className="flex justify-center">
          <nav className="flex space-x-6">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => onTabChange(tab.id)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary bg-transparent hover:bg-transparent"
                    : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}