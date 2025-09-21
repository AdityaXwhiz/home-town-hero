import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  FileText, 
  Building2, 
  CheckCircle, 
  Wrench,
  Eye,
  Camera,
  Send
} from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

export const ProcessFlow = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Observer to trigger animation when the section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setAnimate(true);
          observer.disconnect(); // Animate only once
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("process-flow-section");
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      id: 1,
      title: "Citizen Identifies Issue",
      description: "A community member spots a civic problem that needs attention, like a pothole or a broken streetlight.",
      icon: User,
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Report Submission",
      description: "The issue is reported through our platform with a detailed description, location, and photo evidence.",
      icon: FileText,
      color: "bg-indigo-500",
    },
    {
      id: 3,
      title: "Authority Notification",
      description: "The report is automatically categorized and routed to the correct municipal department for action.",
      icon: Building2,
      color: "bg-purple-500",
    },
    {
      id: 4,
      title: "Issue Validation",
      description: "A municipal employee verifies the report's details, assesses its priority, and updates its status to 'In Progress'.",
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      id: 5,
      title: "Resolution & Update",
      description: "The responsible department resolves the issue, and the final status is updated for the reporter to see.",
      icon: Wrench,
      color: "bg-emerald-500",
    },
  ];

  return (
    <>
      {/* Custom CSS for the animation */}
      <style>
        {`
          .timeline-line-h {
            background: linear-gradient(to right, #ef4444 50%, #3b82f6 50%);
            background-size: 200% 100%;
            background-position: 100% 100%;
            transition: background-position 4s ease-in-out;
          }
          .timeline-line-h.animate {
            background-position: 0% 100%;
          }
          .timeline-arrow-h {
            transition: left 4s ease-in-out;
          }
        `}
      </style>
      <section id="process-flow-section" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From issue identification to resolution – see the transparent journey of how your reports create positive change.
            </p>
          </div>

          {/* Desktop Horizontal Timeline */}
          <div className="hidden md:block relative max-w-6xl mx-auto">
            <div className="absolute top-1/2 -translate-y-1/2 left-10 right-10 h-1 bg-slate-200 rounded-full"></div>
            <div className={`timeline-line-h absolute top-1/2 -translate-y-1/2 left-10 right-10 h-1 rounded-full ${animate ? 'animate' : ''}`}></div>
             <div className={`timeline-arrow-h absolute top-1/2 -translate-y-1/2 w-0 h-0`}
                 style={{
                   borderTop: '8px solid transparent',
                   borderBottom: '8px solid transparent',
                   borderLeft: '12px solid #ef4444',
                   left: animate ? 'calc(100% - 2.5rem)' : '2.5rem',
                 }}
            ></div>

            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="relative flex flex-col items-center w-48 z-10">
                  {/* Card position alternating */}
                  <div className={`mb-auto ${index % 2 === 0 ? 'order-1' : 'order-3'}`}>
                    <Card className="group border-2 border-slate-200/80 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-2">
                      <CardContent className="p-4 text-center">
                        <div className={`${step.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                          <step.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-base mb-1">{step.title}</h3>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Connector Line */}
                  <div className={`h-10 w-0.5 bg-black ${index % 2 === 0 ? 'order-2' : 'order-2'}`}></div>
                  
                  {/* Timeline Dot */}
                  <div className={`w-8 h-8 ${step.color} rounded-full text-white flex items-center justify-center font-bold shadow-lg ${index % 2 === 0 ? 'order-3' : 'order-1'}`}>
                    {step.id}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile Vertical Timeline */}
          <div className="md:hidden space-y-8 relative">
             <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-200 rounded-full"></div>
             <div className={`timeline-line absolute left-6 top-0 bottom-0 w-1 ${animate ? 'animate' : ''}`} style={{background: 'linear-gradient(to bottom, #ef4444 50%, #3b82f6 50%)', backgroundSize: '100% 200%', backgroundPosition: animate ? '100% 0%' : '100% 100%'}}></div>
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-6">
                <div className="relative mt-1 z-10">
                  <div className={`w-12 h-12 ${step.color} rounded-full text-white flex items-center justify-center font-bold text-lg shadow-lg`}>
                    {step.id}
                  </div>
                </div>
                <Card className="flex-1 group border-2 border-slate-200/80">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>


          {/* --- NEW TAGLINE SECTION --- */}
          <div className="mt-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 md:p-12 border-1 border-blue-500">
            <div className="text-center">
                <h3 className="text-3xl font-bold mb-12">
                Ready to Make a Difference?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* SEE IT */}
                <div className="relative h-64 rounded-xl overflow-hidden group shadow-lg">
                    <img src="https://images.pexels.com/photos/6316243/pexels-photo-6316243.jpeg" alt="A person looking at a city street with a pothole" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                    <Eye className="h-10 w-10 mb-2 opacity-80" />
                    <h4 className="text-4xl font-extrabold tracking-tight">SEE IT.</h4>
                    </div>
                </div>
                {/* SNAP IT */}
                <div className="relative h-64 rounded-xl overflow-hidden group shadow-lg">
                    <img src="https://images.pexels.com/photos/5967869/pexels-photo-5967869.jpeg" alt="A person taking a photo with a smartphone" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                    <Camera className="h-10 w-10 mb-2 opacity-80" />
                    <h4 className="text-4xl font-extrabold tracking-tight">SNAP IT.</h4>
                    </div>
                </div>
                {/* REPORT IT */}
                <div className="relative h-64 rounded-xl overflow-hidden group shadow-lg">
                    <img src="https://images.pexels.com/photos/6772077/pexels-photo-6772077.jpeg" alt="A person using a laptop to report an issue" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                    <Send className="h-10 w-10 mb-2 opacity-80" />
                    <h4 className="text-4xl font-extrabold tracking-tight">REPORT IT.</h4>
                    </div>
                </div>
                </div>
                <Link to="/report-issue" className="inline-block mt-12 bg-blue-700 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors">
                    Start Your First Report
                </Link>
            </div>
          </div>
          
        </div>
      </section>
    </>
  );
};

