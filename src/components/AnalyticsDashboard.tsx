import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Clock, CheckCircle, AlertCircle, Users, Calendar, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Main component for the Analytics Dashboard
export const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data from server.');
        }
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Memoize processed data to avoid recalculations on re-renders
  const { stats, pieData, recentReports } = useMemo(() => {
    if (!data) return { stats: [], pieData: [], recentReports: [] };
    
    const stats = [
      {
        title: "Total Reports Submitted",
        value: data.totalReports,
        icon: TrendingUp,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        title: "Issues Resolved",
        value: data.resolvedReports,
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      {
        title: "Pending Resolution",
        value: data.pendingReports,
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      },
      {
        title: "In Progress",
        value: data.inProgressReports,
        icon: AlertCircle,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
    ];

    return { stats, pieData: data.categoryCounts, recentReports: data.recentReports };
  }, [data]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }
  
  if (!data) {
    return <div className="p-6 text-center text-muted-foreground">No data available.</div>;
  }

  return (
    <div className="space-y-8 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover-lift border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-xl shadow-sm`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Pie Chart and Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="shadow-card border-0 lg:col-span-1">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-indigo-100 rounded-lg"><PieChartIcon className="h-5 w-5 text-indigo-600" /></div>
                    Report Breakdown
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-card border-0 lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-green-100 rounded-lg"><Calendar className="h-5 w-5 text-green-600" /></div>
              Recent Reports
            </CardTitle>
            <CardDescription>The latest 5 issues submitted by the community.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">#{report.id} - {report.category}</p>
                    <p className="text-sm text-gray-600">{report.location}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(report.status)} font-medium`}>{report.status}</Badge>
                    <p className="text-xs text-gray-500 mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Impact Section (Static) */}
      <Card className="shadow-card border-0 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <div className="p-3 bg-purple-100 rounded-xl"><Users className="h-6 w-6 text-purple-600" /></div>
            Community Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-xl shadow-sm"><div className="text-4xl font-bold text-purple-600 mb-3">12,543</div><div className="text-gray-600 font-medium">Active Members</div></div>
            <div className="p-6 bg-white rounded-xl shadow-sm"><div className="text-4xl font-bold text-green-600 mb-3">98.2%</div><div className="text-gray-600 font-medium">Satisfaction Rate</div></div>
            <div className="p-6 bg-white rounded-xl shadow-sm"><div className="text-4xl font-bold text-orange-600 mb-3">2.3 days</div><div className="text-gray-600 font-medium">Avg. Resolution Time</div></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Skeleton component for loading state
const AnalyticsSkeleton = () => (
    <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-80 rounded-lg lg:col-span-1" />
            <Skeleton className="h-80 rounded-lg lg:col-span-2" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
    </div>
);
