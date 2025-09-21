// In src/components/Sidebar.tsx
// ✅ THIS FILE IS ALREADY CORRECT. No changes were needed.
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Award,
  Settings,
  Bell,
  TrendingUp,
  MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const navigationItems = [
    {
      section: "Main",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "cases", label: "Case Management", icon: FileText },
        { id: "citizens", label: "Citizens", icon: Users },
      ],
    },
    {
      section: "Analytics",
      items: [
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "badges", label: "Badge Management", icon: Award },
        { id: "trending", label: "Trending Issues", icon: TrendingUp },
      ],
    },
    {
      section: "System",
      items: [
        { id: "alerts", label: "Alerts", icon: Bell },
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className="fixed top-0 left-0 w-64 h-screen bg-civic-sidebar dark:bg-gray-900 border-r border-sidebar-border dark:border-gray-700 flex flex-col z-40"
      aria-label="Sidebar"
    >
      <div className="p-6 border-b border-sidebar-border dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-civic-blue rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-civic-blue dark:text-white">
              CivicSync
            </h1>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navigationItems.map((section) => (
          <div key={section.section}>
            <h3 className="text-xs font-semibold text-muted-foreground dark:text-gray-400 uppercase tracking-wider mb-3">
              {section.section}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-civic-blue text-white shadow-md"
                        // Note: Added dark mode text color for hover state
                        : "text-sidebar-foreground dark:text-gray-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-gray-800 dark:hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {item.id === "alerts" && (
                      <Badge
                        variant="destructive"
                        className="ml-auto text-xs"
                      >
                        3
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border dark:border-gray-700">
        <div className="flex items-center gap-3 text-xs text-muted-foreground dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>System Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;