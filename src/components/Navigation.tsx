import { Button } from "@/components/ui/button";
import { Menu, Bell, User, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavLink, Link, useLocation } from "react-router-dom"; 
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export const Navigation = () => {
  // --- STATE FOR AUTHENTICATION ---
  // In a real app, this would come from a context or state management library.
  const [user, setUser] = useState(null);
  const location = useLocation(); // Hook to get the current page location

  // Check for logged-in user in localStorage on component mount
  useEffect(() => {
    // This is a placeholder for your actual authentication logic.
    // We'll simulate a logged-in user for demonstration.
    const mockUser = { name: "Aditya Singh", email: "aditya@example.com" };
    // To test the logged-out state, comment out the next line.
    setUser(mockUser); 
  }, []);

  const handleLogout = () => {
    // Your actual logout logic would go here
    setUser(null);
  };
  
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.toUpperCase();
  };

  // --- STYLING FOR NAV LINKS ---
  const navLinkClasses = ({ isActive }) =>
    `px-4 py-2 rounded-md font-medium transition-all duration-300 border-b-2 ${
      isActive
        ? 'border-primary text-primary' // Active link style
        : 'border-primary text-muted-foreground' // Inactive links now have blue underline
    } hover:bg-gradient-to-r hover:from-green-400 hover:to-blue-500 hover:text-white hover:border-transparent`;

  // --- STYLING FOR THE "ABOUT" LINK ---
  const aboutLinkClasses = "px-4 py-2 rounded-md font-medium transition-all duration-300 border-b-2 border-primary text-muted-foreground hover:bg-gradient-to-r hover:from-green-400 hover:to-blue-500 hover:text-white hover:border-transparent";

  // --- FUNCTION TO HANDLE HOME CLICK ---
  const handleHomeClick = (e) => {
    // If we are already on the homepage, scroll to top
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // If on another page, the NavLink handles navigation
  };
  
  // --- FUNCTION TO HANDLE SMOOTH SCROLL FOR ABOUT ---
  const handleAboutClick = (e) => {
    // If we are already on the homepage, prevent default navigation and scroll smoothly
    if (location.pathname === '/') {
      e.preventDefault();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // If on another page, the Link component will handle navigating to /#contact
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto pl-3 pr-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Trigger */}
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="text-foreground hover:text-primary" />
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-gradient-to-br from-gray-700 via-gray-900 to-black rounded-lg flex items-center justify-center shadow-md">
                <span className="font-serif font-bold text-xl italic text-white">CS</span>
              </div>
              <span className="text-foreground font-bold text-xl tracking-tight font-serif">CivicSync</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-6">
            <NavLink to="/" className={navLinkClasses} onClick={handleHomeClick}>
              Home
            </NavLink>
            <NavLink to="/progress" className={navLinkClasses}>
              Track Progress
            </NavLink>
            <NavLink to="/community" className={navLinkClasses}>
              Community
            </NavLink>
            <Link to="/#contact" className={aboutLinkClasses} onClick={handleAboutClick}>
              About
            </Link>
          </div>

          {/* Action Buttons & User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            <Button asChild variant="destructive">
              <Link to="/alerts">
                <Bell className="h-4 w-4 mr-2" />
                Alerts
              </Link>
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} />
                      <AvatarFallback className="bg-blue-600 text-white font-bold">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="outline">
                  <a href="/Signuplogin/login.html">
                    <User className="h-4 w-4 mr-2" />
                    LogIn
                  </a>
                </Button>
                <Button asChild>
                  <a href="/Signuplogin/signup.html">
                    SignUp
                  </a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger (re-using the main one) */}
          <div className="md:hidden">
             {/* The SidebarTrigger is already visible on the left */}
          </div>
        </div>
      </div>
    </nav>
  );
};

