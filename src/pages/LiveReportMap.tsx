import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

// Helper function to create a red SVG icon for map markers
const createRedIcon = () => {
    const markerHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#ef4444" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>`;
  
    return new L.DivIcon({
      html: markerHtml,
      className: 'bg-transparent border-none',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
};

const redIcon = createRedIcon();

// A component to handle map events like zooming
const MapEvents = ({ reportToFlyTo }) => {
    const map = useMap();
    useEffect(() => {
        if (reportToFlyTo) {
            map.flyTo([reportToFlyTo.latitude, reportToFlyTo.longitude], 16, {
                animate: true,
                duration: 1.5
            });
        }
    }, [reportToFlyTo, map]);
    return null;
};

export default function LiveReportMap() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchId, setSearchId] = useState('');
    const [reportToFlyTo, setReportToFlyTo] = useState(null);

    // Initial map position centered on Delhi NCR
    const position: LatLngExpression = [28.6139, 77.2090];

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('http://localhost:5001/api/reports');
                if (!response.ok) {
                    throw new Error('Failed to fetch reports. Is the server running?');
                }
                const data = await response.json();
                setReports(data.filter(report => report.latitude && report.longitude));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const handleSearch = () => {
        if (!searchId) return;
        const reportId = parseInt(searchId, 10);
        const report = reports.find(r => r.id === reportId);
        if (report) {
            setReportToFlyTo(report);
        } else {
            alert('Report ID not found.');
        }
    };

    // --- ✨ NEW: Calculate statistics using useMemo for efficiency ---
    const reportStats = useMemo(() => {
        const total = reports.length;
        const pending = reports.filter(r => r.status === 'Pending').length;
        const inProgress = reports.filter(r => r.status === 'In Progress').length;
        const resolved = reports.filter(r => r.status === 'Resolved').length;
        return { total, pending, inProgress, resolved };
    }, [reports]);
    
    // Get the 5 most recent reports for the list
    const recentReports = useMemo(() => reports.slice(0, 5), [reports]);

    return (
        <div className="relative h-screen w-full">
            <MapContainer center={position} zoom={11} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapEvents reportToFlyTo={reportToFlyTo} />
                {reports.map(report => (
                    <Marker
                        key={report.id}
                        position={[report.latitude, report.longitude]}
                        icon={redIcon}
                    >
                        <Popup>
                            <div className="p-1 max-w-xs space-y-2">
                                <h3 className="font-bold capitalize text-base">{report.category.replace('_', ' ')} Issue</h3>
                                <p className="text-sm"><strong>ID:</strong> {report.id}</p>
                                <p className="text-sm text-muted-foreground">{report.description}</p>
                                <p className="text-sm"><strong>Status:</strong> <span className="font-semibold">{report.status}</span></p>
                                <Button asChild size="sm" className="w-full">
                                    <Link to={`/report/${report.id}`}>View Full Details</Link>
                                </Button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            <div className="absolute top-4 left-4 z-[1000]">
                <Card className="w-full sm:w-96">
                    <CardHeader>
                        <CardTitle>Live Issue Hotspot Map</CardTitle>
                        <CardDescription>Search or click a pin to view details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Search by Report ID..."
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch}><Search size={16} /></Button>
                        </div>
                        {loading && <div className="flex items-center text-sm text-muted-foreground mt-2"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading reports...</div>}
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

                        {/* --- ✨ NEW: Report Statistics Section --- */}
                        <div className="mt-4 space-y-2">
                            <h4 className="font-semibold text-sm">Live Report Stats</h4>
                            <div className="flex justify-between items-center text-sm p-2 bg-muted rounded-md">
                                <span className="font-bold">Total Reports:</span>
                                <Badge variant="secondary">{reportStats.total}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span>Pending:</span>
                                <Badge variant="outline">{reportStats.pending}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span>In Progress:</span>
                                <Badge variant="outline">{reportStats.inProgress}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span>Resolved:</span>
                                <Badge variant="default">{reportStats.resolved}</Badge>
                            </div>
                        </div>

                        {/* --- ✨ NEW: Recent Reports List --- */}
                        <div className="mt-4">
                            <h4 className="font-semibold text-sm mb-2 flex items-center"><List className="mr-2 h-4 w-4" /> Recent Reports</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {recentReports.map(report => (
                                    <div 
                                        key={report.id} 
                                        className="text-xs p-2 rounded-md hover:bg-muted cursor-pointer"
                                        onClick={() => setReportToFlyTo(report)}
                                    >
                                        <p className="font-bold capitalize">ID: {report.id} - {report.category}</p>
                                        <p className="text-muted-foreground truncate">{report.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}