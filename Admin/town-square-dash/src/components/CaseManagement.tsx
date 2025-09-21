// In src/components/CaseManagement.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, X as ClearIcon } from "lucide-react";
// ✅ FIX: Import Socket.IO client
import { io, Socket } from "socket.io-client";

type ReportStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';

interface Report {
    id: number;
    category: string;
    description: string;
    location: string;
    status: ReportStatus;
    created_at: string;
    deadline: string | null;
    map_url: string;
    image_urls: string | string[] | null;
}

// ✅ FIX: Initialize socket connection outside the component
const socket: Socket = io("http://localhost:5001");

const statusStyles: { [key in ReportStatus]: string } = {
  Pending: 'bg-yellow-100/50 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700',
  'In Progress': 'bg-blue-100/50 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
  Resolved: 'bg-green-100/50 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700',
  Rejected: 'bg-red-100/50 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700',
};

const getFirstImageUrl = (report: Report): string | null => {
    const { image_urls } = report; 
    if (!image_urls) return null;

    let urls: string[] = [];
    if (Array.isArray(image_urls)) urls = image_urls;
    else if (typeof image_urls === 'string' && image_urls.startsWith('[')) {
        try { urls = JSON.parse(image_urls); } catch { return null; }
    } else if (typeof image_urls === 'string') {
        urls = [image_urls];
    }

    if (urls.length > 0 && urls[0]) return `http://localhost:5001${urls[0]}`;
    return null;
};

const CaseManagement: React.FC = () => {
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const uniqueCategories = useMemo(() => {
        const categories = new Set(allReports.map(report => report.category));
        return Array.from(categories);
    }, [allReports]);

    useEffect(() => {
        const fetchAllReports = async () => {
            try {
                const res = await fetch("http://localhost:5001/api/reports");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setAllReports(data);
            } catch (err: any) {
                setError(err.message ?? "Unknown error");
            } finally {
                setLoading(false);
            }
        };
        fetchAllReports();

        // ✅ FIX: Set up real-time event listeners
        const handleNewReport = (newReport: Report) => {
            setAllReports(prevReports => [newReport, ...prevReports]);
        };
        const handleReportUpdate = (updatedReport: Report) => {
            setAllReports(prevReports => 
                prevReports.map(r => r.id === updatedReport.id ? updatedReport : r)
            );
        };

        socket.on('new_report', handleNewReport);
        socket.on('report_updated', handleReportUpdate);

        // ✅ FIX: Clean up listeners when the component unmounts
        return () => {
            socket.off('new_report', handleNewReport);
            socket.off('report_updated', handleReportUpdate);
        };
    }, []);

    const filteredReports = useMemo(() => {
        let reportsToFilter = [...allReports];
        if (statusFilter) {
            reportsToFilter = reportsToFilter.filter(r => r.status === statusFilter);
        }
        if (categoryFilter) {
            reportsToFilter = reportsToFilter.filter(r => r.category === categoryFilter);
        }
        if (startDate) {
            reportsToFilter = reportsToFilter.filter(r => new Date(r.created_at) >= new Date(startDate));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            reportsToFilter = reportsToFilter.filter(r => new Date(r.created_at) < end);
        }
        return reportsToFilter;
    }, [statusFilter, categoryFilter, startDate, endDate, allReports]);

    const clearFilters = () => {
        setStatusFilter('');
        setCategoryFilter('');
        setStartDate('');
        setEndDate('');
    };

    const updateStatus = async (reportId: number, newStatus: ReportStatus) => {
        // Optimistic update is no longer needed as the socket event will handle it,
        // but we still need to send the request to the server.
        try {
            await fetch(`http://localhost:5001/api/reports/${reportId}/status`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }),
            });
        } catch (err) {
            console.error("Failed to update status:", err);
            // Here you could add logic to revert the change if the API call fails
        }
    };

    const updateDeadline = async (reportId: number, newDeadline: string) => {
      // This function doesn't have a real-time equivalent yet, so we'll keep the optimistic update.
        const originalReports = [...allReports];
        const updatedReports = allReports.map(r => r.id === reportId ? { ...r, deadline: newDeadline } : r);
        setAllReports(updatedReports);
        
        try {
            // NOTE: This endpoint needs to be created in your server.js
            await fetch(`http://localhost:5001/api/reports/${reportId}/deadline`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deadline: newDeadline }),
            });
        } catch (err) {
            setAllReports(originalReports);
        }
    };

    if (loading) return <p className="text-center p-6 text-foreground">Loading reports...</p>;
    if (error) return <p className="text-center p-6 text-destructive">{error}</p>;

    return (
        <div className="p-6 flex flex-col h-[calc(100vh-8rem)]">
            <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Case Management</h2>
                <Card className="bg-primary text-primary-foreground p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-primary-foreground/80 mb-1">Category</label>
                            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-white text-black border-border rounded-md p-2">
                                <option value="">All Categories</option>
                                {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-primary-foreground/80 mb-1">Status</label>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white text-black border-border rounded-md p-2">
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-primary-foreground/80 mb-1">Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white text-black border-border rounded-md p-1.5" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-primary-foreground/80 mb-1">End Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white text-black border-border rounded-md p-1.5" />
                        </div>
                        <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2 hover:bg-primary-foreground/10 text-primary-foreground"><ClearIcon size={16}/> Clear Filters</Button>
                    </div>
                </Card>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                    {filteredReports.map((report) => {
                        const imageUrl = getFirstImageUrl(report);
                        const isOverdue = report.deadline && new Date(report.deadline) < new Date() && (report.status === 'Pending' || report.status === 'In Progress');
                        return (
                            <Link key={report.id} to={`/report/${report.id}`} className="block">
                                <Card className={`bg-card text-card-foreground shadow-lg transition-all border hover:border-primary/50 ${isOverdue ? 'border-destructive' : 'border-transparent'}`}>
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg capitalize">{report.category} issue</CardTitle>
                                                    <div className="flex items-center gap-2">
                                                        {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                                                        <Badge className={`border text-xs ${statusStyles[report.status]}`}>{report.status}</Badge>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground pt-1">{report.description.substring(0, 150)}...</p>
                                                <div className="flex items-center text-sm text-muted-foreground gap-4 mt-4">
                                                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(report.created_at).toLocaleDateString()}</span>
                                                    <a href={report.map_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                                                        <MapPin className="h-4 w-4" />View on Map
                                                    </a>
                                                </div>
                                            </div>
                                            {imageUrl && (
                                                <img src={imageUrl} alt={report.category} className="w-32 h-32 object-cover rounded-md border border-border" />
                                            )}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-end gap-4" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                            <div className="flex items-center">
                                                <label htmlFor={`deadline-${report.id}`} className="text-sm font-medium mr-2">Deadline:</label>
                                                <input type="date" id={`deadline-${report.id}`} value={report.deadline ? report.deadline.split('T')[0] : ''} onChange={(e) => updateDeadline(report.id, e.target.value)} className="bg-background text-foreground border-border rounded-md text-sm p-1.5"/>
                                            </div>
                                            <div className="flex items-center">
                                                <label htmlFor={`status-${report.id}`} className="text-sm font-medium mr-2">Status:</label>
                                                <select id={`status-${report.id}`} value={report.status} onChange={(e) => updateStatus(report.id, e.target.value as ReportStatus)} className="bg-background text-foreground border-border rounded-md shadow-sm text-sm p-1.5">
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Resolved">Resolved</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CaseManagement;