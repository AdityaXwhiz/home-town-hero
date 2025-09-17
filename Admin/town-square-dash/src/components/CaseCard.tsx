import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Star, 
  Calendar, 
  User, 
  Image as ImageIcon,
  Mic,
  Eye,
  CheckCircle2
} from "lucide-react";

interface CaseCardProps {
  case_: {
    id: string;
    title: string;
    description: string;
    status: "active" | "in-progress" | "completed";
    priority: "low" | "medium" | "high";
    assignedTo: string;
    reportedBy: string;
    category: string;
    location: string;
    createdAt: string;
    rating?: number;
    hasPhoto?: boolean;
    hasVoiceNote?: boolean;
    coordinates?: { lat: number; lng: number };
  };
  onMarkComplete: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const CaseCard = ({ case_, onMarkComplete, onViewDetails }: CaseCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "in-progress": return "bg-warning text-warning-foreground";
      case "active": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="bg-gradient-card-overlay border-0 shadow-card hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-civic-blue">{case_.title}</h3>
              <Badge className={getStatusColor(case_.status)} variant="secondary">
                {case_.status.replace("-", " ")}
              </Badge>
              <Badge className={getPriorityColor(case_.priority)} variant="outline">
                {case_.priority}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-3 leading-relaxed">{case_.description}</p>
          </div>
        </div>

        {/* Case Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-civic-teal" />
            <span>{case_.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-civic-teal" />
            <span>{new Date(case_.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4 text-civic-teal" />
            <span>Reported by: {case_.reportedBy}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4 text-civic-teal" />
            <span>Assigned: {case_.assignedTo}</span>
          </div>
        </div>

        {/* Media Indicators */}
        <div className="flex items-center gap-4 mb-4">
          {case_.hasPhoto && (
            <div className="flex items-center gap-1 text-civic-blue text-xs">
              <ImageIcon className="w-3 h-3" />
              <span>Photo</span>
            </div>
          )}
          {case_.hasVoiceNote && (
            <div className="flex items-center gap-1 text-civic-blue text-xs">
              <Mic className="w-3 h-3" />
              <span>Voice Note</span>
            </div>
          )}
          {case_.coordinates && (
            <div className="flex items-center gap-1 text-civic-blue text-xs">
              <MapPin className="w-3 h-3" />
              <span>GPS Location</span>
            </div>
          )}
          {case_.rating && (
            <div className="flex items-center gap-1 text-amber-500 text-xs ml-auto">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{case_.rating}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(case_.id)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </Button>
          
          {case_.status === "in-progress" && (
            <Button 
              onClick={() => onMarkComplete(case_.id)}
              className="bg-civic-blue hover:bg-civic-blue-dark text-white flex items-center gap-2"
              size="sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseCard;