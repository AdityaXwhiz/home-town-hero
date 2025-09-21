// In src/components/ReportDetailPage.tsx
// ✅ THIS FILE IS ALREADY CORRECT. No changes were needed.
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X as CloseIcon, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface Report {
    id: number;
    category: string;
    description: string;
    location: string;
    status: string;
    created_at: string;
    deadline: string | null;
    image_urls: string | string[] | null;
    voice_note_url: string | null;
    map_url: string;
}

const getImageUrls = (imageUrls: string | string[] | null): string[] => {
    if (!imageUrls) return [];
    let urls: string[] = [];

    if (Array.isArray(imageUrls)) {
        urls = imageUrls;
    } else if (typeof imageUrls === 'string' && imageUrls.startsWith('[')) {
        try { urls = JSON.parse(imageUrls); } catch (e) { return []; }
    } else if (typeof imageUrls === 'string') {
        urls = [imageUrls];
    }
    
    return urls.map(url => `http://localhost:5001${url}`);
};

export const ReportDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

    useEffect(() => {
        fetch(`http://localhost:5001/api/reports/${id}`)
            .then(res => res.json())
            .then(data => setReport(data))
            .catch(err => console.error("Failed to fetch report details:", err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p className="p-6 text-foreground">Loading report details...</p>;
    if (!report) return <p className="p-6 text-destructive">Report not found.</p>;

    const imageUrls = getImageUrls(report.image_urls);
    const audioUrl = report.voice_note_url ? `http://localhost:5001${report.voice_note_url}` : null;

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeImageIndex !== null) {
            setActiveImageIndex((prevIndex) => (prevIndex! + 1) % imageUrls.length);
        }
    };
    
    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeImageIndex !== null) {
            setActiveImageIndex((prevIndex) => (prevIndex! - 1 + imageUrls.length) % imageUrls.length);
        }
    };

    return (
        <>
            <div className="bg-background text-foreground min-h-screen p-6">
                <Link to="/" className="inline-flex items-center gap-2 text-primary mb-6 hover:underline">
                    <ArrowLeft size={16} />
                    Back to Case Management
                </Link>

                <div className="bg-card p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold capitalize">{report.category}</h1>
                            <p className="text-muted-foreground">{report.location}</p>
                        </div>
                        <Badge>{report.status}</Badge>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Submitted Images</h3>
                            {imageUrls.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {imageUrls.map((url, index) => (
                                        <img
                                            key={index}
                                            src={url}
                                            alt={`${report.category} image ${index + 1}`}
                                            className="rounded-md border border-border w-full h-24 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => setActiveImageIndex(index)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-24 flex items-center justify-center bg-secondary rounded-lg">
                                    <p className="text-muted-foreground">No Images Submitted</p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">Description</h3>
                                <p className="text-muted-foreground">{report.description}</p>
                            </div>
                            {audioUrl && (
                                 <div>
                                    <h3 className="font-semibold text-lg">Voice Note</h3>
                                    <audio controls src={audioUrl} className="w-full mt-2">Your browser does not support the audio element.</audio>
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-lg">Submitted On</h3>
                                <p className="text-muted-foreground">{new Date(report.created_at).toLocaleString()}</p>
                            </div>
                            {report.deadline && (
                                <div>
                                    <h3 className="font-semibold text-lg">Deadline</h3>
                                    <p className="text-muted-foreground">{new Date(report.deadline).toLocaleDateString()}</p>
                                </div>
                            )}
                            <Button asChild variant="outline" className="w-full">
                                <a href={report.map_url} target="_blank" rel="noopener noreferrer">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    View on Map
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {activeImageIndex !== null && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                    onClick={() => setActiveImageIndex(null)}
                >
                    <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-50">
                        <CloseIcon size={32} />
                    </button>
                    
                    {imageUrls.length > 1 && (
                        <>
                            <button onClick={handlePrevImage} className="absolute left-4 text-white p-2 bg-black/30 rounded-full hover:bg-black/50 z-50">
                                <ChevronLeft size={32} />
                            </button>
                            <button onClick={handleNextImage} className="absolute right-4 text-white p-2 bg-black/30 rounded-full hover:bg-black/50 z-50">
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}

                    <img 
                        src={imageUrls[activeImageIndex]} 
                        alt="Enlarged report" 
                        className="max-w-[90vw] max-h-[90vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};