import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Mic, ExternalLink, Image } from "lucide-react";

interface Report {
    id: number;
    category: string;
    description: string;
    location: string;
    status: string;
    created_at: string;
    latitude: number;
    longitude: number;
    map_url: string;
    details: any; // Change the type to `any` to handle both object and string
    image_urls: string[] | string | null;
    voice_note_url: string | null;
}

const CaseManagement: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = async () => {
        try {
            const res = await fetch("http://localhost:5001/api/reports");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            const parsedReports = data.map((report: any) => {
                let parsedDetails = report.details;
                // Check if the details field is a string before trying to parse
                if (typeof report.details === 'string') {
                    try {
                        parsedDetails = JSON.parse(report.details);
                    } catch (e) {
                        console.error("Failed to parse details JSON:", e);
                        parsedDetails = {}; // Fallback to an empty object
                    }
                }
                
                return {
                    ...report,
                    details: parsedDetails,
                };
            });
            
            setReports(parsedReports);
        } catch (err: any) {
            console.error("Failed to fetch reports:", err);
            setError(err.message ?? "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const updateStatus = async (reportId: number, newStatus: string) => {
        try {
            const res = await fetch(`http://localhost:5001/api/reports/${reportId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await fetchReports();
        } catch (err: any) {
            console.error("Failed to update status:", err);
            setError(err.message ?? "Unknown error");
        }
    };

    if (loading) return <p className="text-center p-6">Loading reports...</p>;
    if (error) return <p className="text-center p-6 text-red-600">Error: {error}</p>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-civic-blue mb-6">Case Management</h2>
            {reports.length === 0 ? (
                <p className="text-muted-foreground">No reports available.</p>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => {
                        const imageUrls = Array.isArray(report.image_urls)
                            ? report.image_urls
                            : report.image_urls?.split(',') || [];
                        
                        // Check for specific details to display
                        const potholeSize = report.details?.potholeSize;
                        const streetlightIssue = report.details?.lightIssueType;
                        const binStatus = report.details?.binStatus;
                        
                        return (
                            <Card key={report.id} className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg capitalize">
                                            {report.category} issue
                                        </CardTitle>
                                        <Badge>
                                            {report.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(report.created_at).toLocaleDateString()}</span>
                                        <a href={report.map_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                                            <MapPin className="h-4 w-4" />View on Map
                                        </a>
                                    </div>
                                    
                                    {/* Display specific details based on category */}
                                    {potholeSize && <p>Pothole Size: {potholeSize}</p>}
                                    {streetlightIssue && <p>Streetlight Issue: {streetlightIssue}</p>}
                                    {binStatus && <p>Bin Status: {binStatus}</p>}

                                    {/* Display Images */}
                                    {imageUrls.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-sm mb-2">Attached Images</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {imageUrls.map((url: string, index: number) => (
                                                    <a key={index} href={`http://localhost:5001${url}`} target="_blank" rel="noopener noreferrer">
                                                        <img src={`http://localhost:5001${url}`} alt={`Report image ${index + 1}`} className="w-24 h-24 object-cover rounded-md" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Display Audio */}
                                    {report.voice_note_url && (
                                        <div>
                                            <h4 className="font-semibold text-sm mb-2">Voice Note</h4>
                                            <audio controls src={`http://localhost:5001${report.voice_note_url}`} className="w-full" />
                                        </div>
                                    )}
                                    {/* Admin Actions */}
                                    <div className="flex gap-2 justify-end">
                                        {report.status !== 'Resolved' && (
                                            <Button onClick={() => updateStatus(report.id, 'Resolved')}>Mark as Resolved</Button>
                                        )}
                                        {report.status !== 'In Progress' && (
                                            <Button variant="secondary" onClick={() => updateStatus(report.id, 'In Progress')}>Mark In Progress</Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CaseManagement;