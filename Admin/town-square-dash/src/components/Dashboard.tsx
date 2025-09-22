import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Settings,
  Bell,
  Briefcase,
  Siren,
  Map, // For the sidebar link
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Import all necessary page and chart components
import CaseManagement from "./CaseManagement";
import { SettingsPage } from './SettingsPage';
import { AlertsPage } from './AlertsPage';
import LiveReportMap from './LiveReportMap'; // The new standalone map page
import { TopCategoriesChart } from './TopCategoriesChart';
import { AvgResolutionTimeChart } from './AvgResolutionTimeChart';
import { CaseStatusPieChart } from "./CaseStatusPieChart";
import { MonthlyTrendsChart } from "./MonthlyTrendsChart";

// ✅ This is your detailed DashboardView, now correctly integrated.
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
            {/* ❌ The old map component is no longer displayed on the main dashboard */}
        </div>
    );
};

// --- THIS SECTION MANAGES THE LAYOUT AND NAVIGATION ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void; }) => {
  // ✅ The "Live Map" link is included here
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "cases", label: "Case Management", icon: Briefcase },
    { id: "map", label: "Live Map", icon: Map },
    { id: "alerts", label: "Alerts", icon: Siren },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-card text-card-foreground h-screen p-4 flex flex-col border-r border-border">
      <div className="p-4 mb-4">
        <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
      </div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-base",
              activeTab === item.id
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground font-medium"
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

  // A wrapper to ensure the map takes up the full screen height and width
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
      // ✅ This case handles rendering the new fullscreen map
      case "map":
        return <FullScreenWrapper><LiveReportMap /></FullScreenWrapper>;
      default:
        return <div className="p-6"><DashboardView /></div>;
    }
  };

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 bg-background text-foreground min-h-screen">
        {/* The header is hidden when the map is active to allow for a fullscreen view */}
        {activeTab !== 'map' && (
            <header className="flex items-center justify-between bg-card text-card-foreground shadow-sm p-4 border-b border-border h-16">
                <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
                <div className="flex items-center space-x-4">
                    <Bell className="text-muted-foreground" />
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">A</div>
                </div>
            </header>
        )}
        {/* This is the main content area */}
        {renderDashboardContent()}
      </main>
    </div>
  );
};

export default Dashboard;

