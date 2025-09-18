import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Award, Heart, Lightbulb } from "lucide-react";
import heroImage from "@/assets/civic-hero.jpg";
import { Link } from "react-router-dom"; // <-- 1. IMPORT LINK

export const HeroSection = () => {
  return (
    <section className="relative h-screen bg-gradient-hero flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center text-white max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your Voice,
            <span className="text-yellow-300"> Our City's</span> Future
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100 leading-relaxed">
            Report civic issues instantly. Track progress in real-time. Build a better community together.
          </p>
          
          {/* --- 2. UPDATED BUTTONS --- */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" variant="outline" className="bg-white text-black hover:bg-white/10 text-lg px-8 py-4">
              <Link to="/report-issue">Report an Issue</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-black border-white hover:bg-white/10 text-lg px-8 py-4">
              <Link to="/Progress">View Progress</Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105">
              <Users className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-2">12,543</div>
              <div className="text-gray-200 text-sm">Active Citizens</div>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105">
              <Award className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-2">8,901</div>
              <div className="text-gray-200 text-sm">Issues Resolved</div>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105">
              <Heart className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-2">156</div>
              <div className="text-gray-200 text-sm">NGO Partners</div>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105">
              <Lightbulb className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-2">42</div>
              <div className="text-gray-200 text-sm">Awareness Programs</div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};