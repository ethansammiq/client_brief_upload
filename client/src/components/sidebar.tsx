import { 
  Home, 
  Folder, 
  Package, 
  BarChart3, 
  Settings,
  ChartLine,
  User
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ChartLine className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text">MiQ RFP Builder</h1>
            <p className="text-xs text-gray-500">Media Planning Tool</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <a
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary text-white"
        >
          <Home className="w-4 h-4" />
          <span className="font-medium">Dashboard</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <Folder className="w-4 h-4" />
          <span className="font-medium">RFP Responses</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <Package className="w-4 h-4" />
          <span className="font-medium">Product Library</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="font-medium">Analytics</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <Settings className="w-4 h-4" />
          <span className="font-medium">Settings</span>
        </a>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Sarah Johnson</p>
            <p className="text-xs text-gray-500">Sales Strategist</p>
          </div>
        </div>
      </div>
    </div>
  );
}
