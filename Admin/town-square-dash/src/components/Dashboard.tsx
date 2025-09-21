import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Settings,
  Bell,
  Briefcase,
  Siren,
  FileText,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ✅ FIX: Imports have been cleaned up to match standard conventions
import CaseManagement from "./CaseManagement";
import { SettingsPage } from './SettingsPage';
import { AlertsPage } from './AlertsPage';
import { TopCategoriesChart } from './TopCategoriesChart';
import { ReportMap } from './ReportMap';
import { AvgResolutionTimeChart } from './AvgResolutionTimeChart';
import { CaseStatusPieChart } from "./CaseStatusPieChart";
import { MonthlyTrendsChart } from "./MonthlyTrendsChart";


const DashboardView = () => {
    // State to hold the entire analytics object from the server.
    // Using 'any' for simplicity, but you can create a more specific interface.
    const [analyticsData, setAnalyticsData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetching from the single, correct endpoint.
        fetch('http://localhost:5001/api/analytics')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
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

    // Calculating active cases on the client-side from the fetched data.
    const activeCases = analyticsData ? analyticsData.pendingReports + analyticsData.inProgressReports : 0;
    
    // NOTE: Your /api/analytics endpoint does not currently return an average response time.
    // This KPI card will show 'N/A' until you add that calculation to your server.js.
    const avgResponseTime = analyticsData?.avgResponseTime || 'N/A';

    return (
        <div>
            <h1 className="text-3xl font-bold text-foreground mb-6">Welcome, Admin</h1>
            
            <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : activeCases}</div>
                  <p className="text-xs text-muted-foreground">Currently open pending & in-progress cases</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : analyticsData?.pendingReports}</div>
                  <p className="text-xs text-muted-foreground">New reports awaiting action</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : `${avgResponseTime}h`}</div>
                  <p className="text-xs text-muted-foreground">Average for resolved cases this week</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg-grid-cols-5 gap-6 mt-6">
              <Card className="lg-col-span-2">
                   <CardHeader>
                        <CardTitle>Case Status Overview</CardTitle>
                        <CardDescription>A live breakdown of all case statuses.</CardDescription>
                   </CardHeader>
                   <CardContent><div className="h-64"><CaseStatusPieChart data={analyticsData?.categoryCounts} /></div></CardContent>
              </Card>
              <Card className="lg-col-span-3">
                  <CardHeader>
                        <CardTitle>Monthly Trends</CardTitle>
                        <CardDescription>Cases created vs. resolved over the last 6 months.</CardDescription>
                  </CardHeader>
                  <CardContent><div className="h-64"><MonthlyTrendsChart data={analyticsData?.recentReports} /></div></CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg-grid-cols-2 gap-6 mt-6">
                <Card>
                     <CardHeader>
                        <CardTitle>Top 5 Report Categories</CardTitle>
                        <CardDescription>The most frequently reported issues.</CardDescription>
                     </CardHeader>
                     <CardContent><div className="h-80"><TopCategoriesChart data={analyticsData?.categoryCounts} /></div></CardContent>
                </Card>
                <Card>
                     <CardHeader>
                        <CardTitle>Average Resolution Time</CardTitle>
                        <CardDescription>Average time taken to resolve different issues.</CardDescription>
                     </CardHeader>
                    <CardContent><div className="h-80"><AvgResolutionTimeChart data={analyticsData?.categoryCounts} /></div></CardContent>
                </Card>
            </div>
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Open Case Locations</CardTitle>
                        <CardDescription>A map of all pending and in-progress cases.</CardDescription>
                    </CardHeader>
                    <CardContent><div className="h-96 rounded-lg overflow-hidden"><ReportMap data={analyticsData?.recentReports} /></div></CardContent>
                </Card>
            </div>
        </div>
    );
};

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void; }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "cases", label: "Case Management", icon: Briefcase },
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

  const renderDashboardContent = () => {
    switch (activeTab) {
      case "cases":
        return <CaseManagement />;
      case "alerts":
        return <AlertsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 bg-background text-foreground min-h-screen">
        <header className="flex items-center justify-between bg-card text-card-foreground shadow-sm p-4 border-b border-border h-16">
          <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
          <div className="flex items-center space-x-4">
            <Bell className="text-muted-foreground" />
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              A
            </div>
          </div>
        </header>
        <div className="p-6">{renderDashboardContent()}</div>
      </main>
    </div>
  );
};

export default Dashboard;