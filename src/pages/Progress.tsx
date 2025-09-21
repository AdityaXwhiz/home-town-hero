import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

type ReportStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';

interface Report {
    id: number;
    category: string;
    description: string;
    status: ReportStatus;
    created_at: string;
    deadline: string | null;
}

const statusStyles: { [key in ReportStatus]: string } = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
  Resolved: 'bg-green-100 text-green-800 border-green-300',
  Rejected: 'bg-red-100 text-red-800 border-red-300',
};

const Progress: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/reports');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setReports(data);
            } catch (err: any) {
                setError(err.message ?? 'Unknown error');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) return <p className="text-center p-6">Loading your reports...</p>;
    if (error) return <p className="text-center p-6 text-red-600">Error: {error}</p>;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Track Your Reports</h1>
                {reports.length === 0 ? (
                    <p className="text-center text-gray-500">You have not submitted any reports yet.</p>
                ) : (
                    // ✅ CHANGED: Replaced single-column layout with a responsive grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report) => (
                            // ✅ CHANGED: Removed width constraints to allow the card to fit in the grid
                            <Card key={report.id} className="shadow-md flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="capitalize">{report.category} Issue</CardTitle>
                                        <Badge className={`border ${statusStyles[report.status]}`}>{report.status}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{report.description}</p>
                                </CardHeader>
                                <CardContent className="border-t pt-4 mt-auto">
                                    <div className="flex flex-col space-y-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Reported on {new Date(report.created_at).toLocaleDateString()}
                                        </span>

                                        {report.deadline && (
                                            <span className="flex items-center gap-2 font-semibold text-blue-600">
                                                <Clock className="h-4 w-4" />
                                                Expected Resolution By: {new Date(report.deadline).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Progress;