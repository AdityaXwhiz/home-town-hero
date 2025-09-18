import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet'; // Import LatLngExpression type
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from 'lucide-react';

// Helper function to create colored SVG icons for map markers
const createColoredIcon = (color) => {
    const markerHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
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

const getPinIcon = (category) => {
    switch (category?.toLowerCase()) {
        case 'pothole':
        case 'road_safety':
            return createColoredIcon('#ef4444'); // Red
        case 'streetlight':
            return createColoredIcon('#f97316'); // Orange
        case 'trash':
            return createColoredIcon('#3b82f6'); // Blue
        default:
            return createColoredIcon('#6b7280'); // Gray
    }
};

// A small component to handle map events like zooming to a location
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

    // --- FIX: Explicitly type the position to satisfy TypeScript ---
    // Initial map position centered on Mumbai
    const position: LatLngExpression = [19.0760, 72.8777];

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
                        icon={getPinIcon(report.category)}
                    >
                        <Popup>
                            <div className="p-1 max-w-xs">
                                <h3 className="font-bold">{report.category.replace('_', ' ')}</h3>
                                <p className="text-xs">{report.description}</p>
                                <p className="text-xs mt-1">Status: <span className="font-semibold">{report.status}</span></p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            <div className="absolute top-4 left-4 z-[1000]">
                <Card className="w-full sm:w-80">
                    <CardHeader>
                        <CardTitle>Issue Hotspot Map</CardTitle>
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

