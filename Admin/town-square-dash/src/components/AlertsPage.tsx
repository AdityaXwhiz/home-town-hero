import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, MapPin } from "lucide-react";
import { Link } from 'react-router-dom';
import { io, Socket } from "socket.io-client";

interface ActionableReport {
    id: number;
    category: string;
    location: string;
    deadline: string | null;
    final_deadline: string | null;
    map_url: string;
    // Add status to handle real-time updates correctly
    status?: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
}

type AlertFilter = 'all' | 'critical' | 'overdue' | 'warning';

const alertStyles = {
  critical: 'bg-red-500 text-white',
  overdue: 'bg-destructive text-destructive-foreground',
  warning: 'bg-yellow-500 text-yellow-900',
  dueToday: 'bg-orange-500 text-white',
};

type DeadlineStatus = keyof typeof alertStyles;

// Initialize socket connection outside the component to prevent re-connections
const socket: Socket = io("http://localhost:5001");

const getDeadlineInfo = (report: ActionableReport): { status: DeadlineStatus; text: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (report.final_deadline) {
        const finalDeadlineDate = new Date(report.final_deadline);
        if (finalDeadlineDate <= today) {
            return { status: 'critical', text: 'Final Deadline Hit!' };
        }
    }
    
    if (report.deadline) {
        const deadlineDate = new Date(report.deadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { status: 'overdue', text: `${Math.abs(diffDays)} days overdue` };
        if (diffDays === 0) return { status: 'dueToday', text: 'Due Today' };
        return { status: 'warning', text: `${diffDays} days remaining` };
    }

    return { status: 'warning', text: 'No Deadline Set' };
};

export const AlertsPage: React.FC = () => {
    const [actionableReports, setActionableReports] = useState<ActionableReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<AlertFilter>('all');

    useEffect(() => {
        // Fetch initial data when the component mounts
        fetch("http://localhost:5001/api/alerts/actionable")
            .then(res => res.json())
            .then(data => setActionableReports(data))
            .finally(() => setLoading(false));
        
        // --- REAL-TIME LISTENERS ---
        const handleReportUpdate = (updatedReport: ActionableReport) => {
            const isActionable = 
                (updatedReport.status === 'Pending' || updatedReport.status === 'In Progress') 
                && updatedReport.deadline;
            
            setActionableReports(currentReports => {
                const reportExists = currentReports.some(r => r.id === updatedReport.id);

                if (isActionable) {
                    if (reportExists) {
                        // Update the existing report in the list
                        return currentReports.map(r => r.id === updatedReport.id ? updatedReport : r);
                    } else {
                        // Add the new actionable report to the list
                        return [...currentReports, updatedReport];
                    }
                } else {
                    // If the report is no longer actionable (e.g., resolved), remove it
                    return currentReports.filter(r => r.id !== updatedReport.id);
                }
            });
        };

        // A new report could be actionable if created with a deadline
        socket.on('new_report', handleReportUpdate);
        socket.on('report_updated', handleReportUpdate);

        // Cleanup listeners when the component unmounts
        return () => {
            socket.off('new_report', handleReportUpdate);
            socket.off('report_updated', handleReportUpdate);
        };
    }, []);

    const filteredReports = useMemo(() => {
        const sorted = [...actionableReports].sort((a, b) => {
            const dateA = a.deadline ? new Date(a.deadline) : new Date(0);
            const dateB = b.deadline ? new Date(b.deadline) : new Date(0);
            return dateA.getTime() - dateB.getTime();
        });

        if (filter === 'all') return sorted;
        
        return sorted.filter(report => {
            const { status } = getDeadlineInfo(report);
            if (filter === 'critical') return status === 'critical';
            if (filter === 'overdue') return status === 'overdue' || status === 'dueToday';
            if (filter === 'warning') return status === 'warning';
            return false;
        });
    }, [actionableReports, filter]);

    if (loading) return <p className="p-6 text-foreground">Loading alerts...</p>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-foreground">Actionable Cases</h2>
                <div className="flex items-center gap-2">
                    <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
                    <Button variant={filter === 'critical' ? 'destructive' : 'outline'} onClick={() => setFilter('critical')}>Critical</Button>
                    <Button variant={filter === 'overdue' ? 'secondary' : 'outline'} onClick={() => setFilter('overdue')}>Overdue</Button>
                    <Button variant={filter === 'warning' ? 'secondary' : 'outline'} onClick={() => setFilter('warning')}>Upcoming</Button>
                </div>
            </div>

            {filteredReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map(report => {
                        const deadlineInfo = getDeadlineInfo(report);
                        return (
                            <Link to={`/report/${report.id}`} key={report.id}>
                                <Card className={`h-full hover:shadow-xl hover:-translate-y-1 transition-all border-0 ${alertStyles[deadlineInfo.status]}`}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 capitalize">
                                                <AlertTriangle size={20} />
                                                {report.category}
                                            </CardTitle>
                                            <div className="text-sm font-bold whitespace-nowrap px-2 py-1 rounded-md bg-white/20">
                                                {deadlineInfo.text}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm opacity-90">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                Deadline: {report.deadline ? new Date(report.deadline).toLocaleDateString() : 'Not set'}
                                            </span>
                                        </div>
                                        <Button asChild variant="outline" size="sm" className="w-full bg-white/20 border-white/30 hover:bg-white/30" onClick={(e) => e.stopPropagation()}>
                                            <a href={report.map_url} target="_blank" rel="noopener noreferrer">
                                                <MapPin className="mr-2 h-4 w-4" />
                                                View on Map
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 bg-card rounded-lg">
                    <p className="text-muted-foreground">
                        {filter === 'all' ? 'No upcoming or overdue cases. Great job!' : `No ${filter} cases found.`}
                    </p>
                </div>
            )}
        </div>
    );
};
