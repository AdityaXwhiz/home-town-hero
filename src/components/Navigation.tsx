import { Button } from "@/components/ui/button";
import { Menu, Bell, User, ShieldCheck } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "react-router-dom"; // <-- 1. IMPORT LINK

export const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto pl-3 pr-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Trigger */}
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="text-foreground hover:text-primary" />
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-foreground font-bold text-xl">CivicSync</span>
            </div>
          </div>

          {/* --- 2. UPDATED NAVIGATION LINKS --- */}
          <div className="hidden md:flex items-center space-x-12">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            
            <Link to="/progress" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Track Progress
            </Link>

            <Link to="/community" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Community
            </Link>

            {/* This link currently goes to Home. You can change the path once you create an About page. */}
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
          </div>

          {/* Action Buttons (Unchanged, as they link to external HTML pages) */}
          <div className="hidden md:flex items-center space-x-3">
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </Button>
            <Button asChild variant="outline">
              <a href="/Signuplogin/login.html">
                <User className="h-4 w-4 mr-2" />
                LogIn
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/Signuplogin/signup.html">
                <User className="h-4 w-4 mr-2" />
                SignUp
              </a>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
             {/* The main SidebarTrigger is now always visible */}
          </div>
        </div>
      </div>
    </nav>
  );
};