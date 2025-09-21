import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, MapPin, User, Send } from 'lucide-react';

// Helper function to render the specific details from the JSON object
const renderReportDetails = (details) => {
  if (!details) return null;

  // Capitalize the first letter of a string
  const capitalize = (s) => s && s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
      {Object.entries(details).map(([key, value]) => {
        // Create a readable label from the key (e.g., 'potholeSize' -> 'Pothole Size')
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        return (
          <div key={key}>
            <p className="text-sm font-semibold text-muted-foreground">{label}</p>
            <p className="text-base text-foreground">{capitalize(String(value))}</p>
          </div>
        );
      })}
    </div>
  );
};

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  // Function to fetch both report details and comments
  const fetchData = async () => {
    try {
      // Fetch report details
      const reportResponse = await fetch(`http://localhost:5001/api/reports/${id}`);
      if (!reportResponse.ok) throw new Error('Report not found');
      const reportData = await reportResponse.json();
      // **FIX**: Parse the 'details' field from JSON string to an object
      if (reportData.details && typeof reportData.details === 'string') {
        reportData.details = JSON.parse(reportData.details);
      }
      setReport(reportData);

      // Fetch comments for the report
      const commentsResponse = await fetch(`http://localhost:5001/api/reports/${id}/comments`);
      if (!commentsResponse.ok) throw new Error('Could not fetch comments');
      const commentsData = await commentsResponse.json();
      setComments(commentsData);

    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !userName.trim()) {
      alert("Please enter your name and a comment.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/reports/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, commentText: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        setUserName('');
        fetchData(); // Refetch all data to show the new comment
      } else {
        throw new Error('Failed to post comment');
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      alert("Error submitting comment.");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading report details...</div>;
  }

  if (!report) {
    return <div className="p-6 text-center">Report not found.</div>;
  }
  
  // Correctly parse image URLs from a JSON string
  const imageUrls = report.image_urls && typeof report.image_urls === 'string' 
    ? JSON.parse(report.image_urls) 
    : [];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Link to="/reports" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to All Reports
      </Link>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl capitalize">{report.category} Issue</CardTitle>
              <CardDescription className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-1 text-sm pt-2">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Reported on {new Date(report.created_at).toLocaleString()}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{report.location}</span>
              </CardDescription>
            </div>
            <Badge className="text-base">{report.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Submitter Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Submitter Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Name</p>
                <p>{report.name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Phone</p>
                <p>{report.phone}</p>
              </div>
            </div>
          </div>
          
          {/* Category-Specific Details */}
          {report.details && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Issue Specifics</h3>
              {renderReportDetails(report.details)}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-muted-foreground mt-1">{report.description}</p>
          </div>
          
          {/* Voice Note Player */}
          {report.voice_note_url && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Voice Note</h3>
              <audio controls src={`http://localhost:5001${report.voice_note_url}`} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Image Gallery */}
          {imageUrls.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Submitted Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageUrls.map((path, index) => (
                  <a href={`http://localhost:5001${path}`} target="_blank" rel="noopener noreferrer" key={index}>
                    <img
                      src={`http://localhost:5001${path}`}
                      alt={`Report evidence ${index + 1}`}
                      className="rounded-lg object-cover aspect-square hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
          <CardDescription>Discussion and updates regarding this report.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCommentSubmit} className="space-y-4 mb-6">
             <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input 
                id="userName" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="comment">Add a comment</Label>
                <div className="relative">
                    <Textarea
                        id="comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type your comment here..."
                        required
                        className="pr-20"
                    />
                    <Button type="submit" size="icon" className="absolute top-1/2 -translate-y-1/2 right-3">
                        <Send className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
          </form>
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <div className="bg-muted rounded-full h-10 w-10 flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{comment.user_name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.comment_text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-muted-foreground py-4">No comments yet. Be the first to add one!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}