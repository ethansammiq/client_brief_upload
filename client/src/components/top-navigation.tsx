import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Settings } from "lucide-react";

export default function TopNavigation() {
  const navItems = [
    { name: "Intelligence", active: false },
    { name: "Audiences", active: false },
    { name: "Creatives", active: false },
    { name: "Campaigns", active: false },
    { name: "Reports", active: false },
    { name: "Plan", active: true }
  ];

  return (
    <header className="bg-[#2B1B3D] text-white border-b border-gray-800">
      {/* Top bar with logo and user info */}
      <div className="flex items-center px-6 py-3">
        
        
        {/* Centered Navigation Items - Use flex-1 to take remaining space */}
        <div className="flex-1 flex justify-center">
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

        {/* Right side - User info and actions - Fixed width container */}
        <div className="flex items-center space-x-4 w-40 justify-end">
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


    </header>
  );
}