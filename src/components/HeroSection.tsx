import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Award, Heart, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export const HeroSection = () => {
  const [stats, setStats] = useState({
    activeCitizens: '...',
    issuesResolved: '...',
    ngoPartners: '...'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/hero-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        // Format numbers with commas for better readability
        setStats({
          activeCitizens: new Intl.NumberFormat('en-IN').format(data.activeCitizens),
          issuesResolved: new Intl.NumberFormat('en-IN').format(data.issuesResolved),
          ngoPartners: data.ngoPartners,
        });
      } catch (error) {
        console.error("Error fetching hero stats:", error);
        // Set to default values on error
        setStats({
          activeCitizens: '12,543',
          issuesResolved: '8,901',
          ngoPartners: '91'
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      {/* Custom CSS for the background animation */}
      <style>
        {`
          @keyframes kenburns-pan {
            0% {
              background-size: 100% 100%;
              background-position: center center;
            }
            100% {
              background-size: 110% 110%;
              background-position: center center;
            }
          }
          .animate-kenburns {
            animation: kenburns-pan 20s ease-in-out infinite alternate;
          }
        `}
      </style>
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Animated Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center animate-kenburns"
          style={{ backgroundImage: `url('https://images.pexels.com/photos/5932075/pexels-photo-5932075.png')` }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20"></div>
        
        {/* Content */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center text-white max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              A Better City Starts 
              <span className="text-yellow-300 block mt-2">With You.</span> 
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed max-w-3xl mx-auto">
              Spot an issue? Report it instantly. Track its progress in real-time. Join your neighbors in building a better community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-transparent text-white border-2 border-white hover:bg-white/20 text-lg px-8 py-4 backdrop-blur-sm transition-all duration-300">
                <Link to="/report-issue">Report an Issue</Link>
              </Button>
              <Button asChild size="lg" className="bg-transparent text-white border-2 border-white hover:bg-white/20 text-lg px-8 py-4 backdrop-blur-sm transition-all duration-300">
                <Link to="/Progress">View Live Progress</Link>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center hover:bg-white/20 transition-all duration-300 hover:transform hover:-translate-y-2 hover:border-yellow-300">
                <Users className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-2">{stats.activeCitizens}</div>
                <div className="text-gray-200 text-sm">Active Citizens</div>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center hover:bg-white/20 transition-all duration-300 hover:transform hover:-translate-y-2 hover:border-yellow-300">
                <Award className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-2">{stats.issuesResolved}</div>
                <div className="text-gray-200 text-sm">Issues Resolved</div>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center hover:bg-white/20 transition-all duration-300 hover:transform hover:-translate-y-2 hover:border-yellow-300">
                <Heart className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-2">{stats.ngoPartners}</div>
                <div className="text-gray-200 text-sm">NGO Partners</div>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center hover:bg-white/20 transition-all duration-300 hover:transform hover:-translate-y-2 hover:border-yellow-300">
                <Lightbulb className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-2">42</div>
                <div className="text-gray-200 text-sm">Awareness Programs</div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

