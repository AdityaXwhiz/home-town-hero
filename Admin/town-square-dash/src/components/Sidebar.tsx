import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Settings,
  Bell,
  Briefcase,
  Siren,
  Map,
  FileText,
  Users,
  BarChart3,
  Award,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Import all necessary page and chart components
import CaseManagement from "./CaseManagement";
import { SettingsPage } from './SettingsPage';
import { AlertsPage } from './AlertsPage';
import LiveReportMap from './LiveReportMap';
import { TopCategoriesChart } from './TopCategoriesChart';
import { AvgResolutionTimeChart } from './AvgResolutionTimeChart';
import { CaseStatusPieChart } from "./CaseStatusPieChart";
import { MonthlyTrendsChart } from "./MonthlyTrendsChart";

// This is your detailed DashboardView, it remains unchanged.
const DashboardView = () => {
    const [analyticsData, setAnalyticsData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5001/api/analytics')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setAnalyticsData(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching analytics data:", error);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-foreground mb-6">Welcome, Admin</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : analyticsData?.activeCases}</div>
                  <p className="text-xs text-muted-foreground">Currently open pending & in-progress cases</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Siren className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : analyticsData?.pendingReview}</div>
                  <p className="text-xs text-muted-foreground">New reports awaiting action</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : `${analyticsData?.avgResponseTime || 0}h`}</div>
                  <p className="text-xs text-muted-foreground">Average for resolved cases this week</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
              <Card className="lg:col-span-2">
                   <CardHeader>
                        <CardTitle>Case Status Overview</CardTitle>
                        <CardDescription>A live breakdown of all case statuses.</CardDescription>
                   </CardHeader>
                   <CardContent><div className="h-64"><CaseStatusPieChart data={analyticsData?.caseStatusOverview} /></div></CardContent>
              </Card>
              <Card className="lg:col-span-3">
                  <CardHeader>
                        <CardTitle>Monthly Trends</CardTitle>
                        <CardDescription>Cases created vs. resolved over the last 6 months.</CardDescription>
                  </CardHeader>
                  <CardContent><div className="h-64"><MonthlyTrendsChart data={analyticsData?.monthlyTrends} /></div></CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                     <CardHeader>
                        <CardTitle>Top 5 Report Categories</CardTitle>
                        <CardDescription>The most frequently reported issues.</CardDescription>
                     </CardHeader>
                     <CardContent><div className="h-80"><TopCategoriesChart data={analyticsData?.topReportCategories} /></div></CardContent>
                </Card>
                <Card>
                     <CardHeader>
                        <CardTitle>Average Resolution Time</CardTitle>
                        <CardDescription>Average time taken to resolve different issues.</CardDescription>
                     </CardHeader>
                    <CardContent><div className="h-80"><AvgResolutionTimeChart data={analyticsData?.avgResolutionTimeByCategory} /></div></CardContent>
                </Card>
            </div>
        </div>
    );
};

// ✅ Placeholder components for new sidebar links to prevent errors
const PlaceholderPage = ({ title }) => (
    <div className="flex items-center justify-center h-96">
        <h1 className="text-2xl font-semibold text-muted-foreground">{title} - Coming Soon</h1>
    </div>
);
const CitizensPage = () => <PlaceholderPage title="Citizens Management" />;
const AnalyticsPage = () => <PlaceholderPage title="Advanced Analytics" />;
const BadgesPage = () => <PlaceholderPage title="Badge Management" />;
const TrendingPage = () => <PlaceholderPage title="Trending Issues" />;


// --- THIS SECTION MANAGES THE LAYOUT AND NAVIGATION ---
// ✅ This Sidebar component is the new detailed version you provided.
const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void; }) => {
  const navigationItems = [
    {
      section: "Main",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "cases", label: "Case Management", icon: FileText },
        { id: "citizens", label: "Citizens", icon: Users },
        { id: "map", label: "Live Map", icon: Map },
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
      className="w-64 h-screen bg-card text-card-foreground border-r border-border flex flex-col z-40"
      aria-label="Sidebar"
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              CivicSync
            </h1>
            <p className="text-xs text-muted-foreground">
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navigationItems.map((section) => (
          <div key={section.section}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
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
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>System Online</span>
        </div>
      </div>
    </aside>
  );
};


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const FullScreenWrapper = ({ children }) => (
    <div className="w-full h-screen">{children}</div>
  );

  const renderDashboardContent = () => {
    switch (activeTab) {
      case "cases":
        return <div className="p-6"><CaseManagement /></div>;
      case "alerts":
        return <div className="p-6"><AlertsPage /></div>;
      case "settings":
        return <div className="p-6"><SettingsPage /></div>;
      case "map":
        return <FullScreenWrapper><LiveReportMap /></FullScreenWrapper>;
      // ✅ Render placeholders for the new pages
      case "citizens":
        return <div className="p-6"><CitizensPage /></div>;
      case "analytics":
        return <div className="p-6"><AnalyticsPage /></div>;
      case "badges":
        return <div className="p-6"><BadgesPage /></div>;
      case "trending":
        return <div className="p-6"><TrendingPage /></div>;
      default:
        return <div className="p-6"><DashboardView /></div>;
    }
  };

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 bg-background text-foreground min-h-screen">
        {activeTab !== 'map' && (
            <header className="flex items-center justify-between bg-card text-card-foreground shadow-sm p-4 border-b border-border h-16">
                <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
                <div className="flex items-center space-x-4">
                    <Bell className="text-muted-foreground" />
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">A</div>
                </div>
            </header>
        )}
        {renderDashboardContent()}
      </main>
    </div>
  );
};

export default Dashboard;

