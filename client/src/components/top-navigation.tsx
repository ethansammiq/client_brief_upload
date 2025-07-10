import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Settings } from "lucide-react";

export default function TopNavigation() {
  const navItems = [
    { name: "Intelligence", active: false },
    { name: "Audiences", active: false },
    { name: "Creatives", active: true },
    { name: "Campaigns", active: false },
    { name: "Reports", active: false },
    { name: "Plan", active: false }
  ];

  return (
    <header className="bg-[#2B1B3D] text-white border-b border-gray-800">
      {/* Top bar with logo and user info */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-6">
          {/* MiQ Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded flex items-center justify-center">
              <span className="text-black font-bold text-sm">Σ</span>
            </div>
          </div>
          
          {/* Navigation Items */}
          <nav className="flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                className={`text-sm font-medium transition-colors duration-200 ${
                  item.active
                    ? "text-yellow-400 border-b-2 border-yellow-400 pb-1"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
            <Settings className="w-4 h-4" />
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback className="bg-pink-500 text-white text-sm">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Sub-navigation bar */}
      <div className="bg-[#1A0B2E] px-6 py-2">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-1">
            <span className="text-gray-400">US</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">Nike</span>
          </div>
          <div className="flex space-x-6">
            <button className="text-gray-400 hover:text-white">Showcase</button>
            <button className="text-gray-400 hover:text-white">Resources</button>
            <button className="text-gray-400 hover:text-white">Mocks</button>
            <button className="text-gray-400 hover:text-white">Favorites</button>
            <button className="text-gray-400 hover:text-white">MiQ Creative Studio</button>
          </div>
        </div>
      </div>
    </header>
  );
}