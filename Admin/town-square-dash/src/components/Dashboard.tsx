import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Award,
  Settings,
  Bell,
  TrendingUp,
  MapPin,
  Briefcase, // for Case Management
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ✅ Correct import (match filename CaseManagement.tsx)
import CaseManagement from "./CaseManagement";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "cases", label: "Case Management", icon: Briefcase },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "users", label: "Users", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "rewards", label: "Rewards", icon: Award },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-civic-blue text-white h-screen p-6 flex flex-col">
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors",
              activeTab === item.id
                ? "bg-white text-civic-blue font-semibold"
                : "hover:bg-blue-700"
            )}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderDashboardContent = () => {
    switch (activeTab) {
      case "cases":
        return <CaseManagement />; // ✅ Correct usage
      case "reports":
        return <p>Reports Section</p>;
      case "users":
        return <p>Users Section</p>;
      case "analytics":
        return <p>Analytics Section</p>;
      case "rewards":
        return <p>Rewards Section</p>;
      case "settings":
        return <p>Settings Section</p>;
      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-civic-blue mb-6">
              Welcome, Admin
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white shadow-lg rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Active Cases</h3>
                  <Badge className="bg-civic-blue">12</Badge>
                </div>
                <p className="text-3xl font-bold mt-2">128</p>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <TrendingUp size={16} className="mr-1 text-green-500" />
                  +12% this week
                </p>
              </div>

              <div className="bg-white shadow-lg rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Citizen Reports</h3>
                  <FileText className="text-civic-blue" size={20} />
                </div>
                <p className="text-3xl font-bold mt-2">342</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>

              <div className="bg-white shadow-lg rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Response Time</h3>
                  <MapPin className="text-civic-blue" size={20} />
                </div>
                <p className="text-3xl font-bold mt-2">2.4h</p>
                <p className="text-sm text-muted-foreground">
                  Avg. this week
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 bg-gray-50 min-h-screen">
        {/* Top Bar */}
        <div className="flex items-center justify-between bg-white shadow-sm p-4">
          <h1 className="text-xl font-semibold text-civic-blue">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Bell className="text-civic-blue" />
            <div className="w-8 h-8 rounded-full bg-civic-blue flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{renderDashboardContent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
