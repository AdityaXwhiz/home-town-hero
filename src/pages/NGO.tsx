import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building, Handshake, Target, Users, Mail, Loader2, Plus, X } from "lucide-react";

// --- Role Card Component (No changes) ---
const RoleCard = ({ icon, title, description }) => (
  <Card className="bg-white text-center p-6 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-blue-400 hover:border-red-500">
    <div className="bg-blue-100 p-4 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="font-semibold text-lg mb-2 text-slate-800">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </Card>
);

// --- NGO Card Component (No changes) ---
const NgoCard = ({ ngo }) => {
    const logo = ngo.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();

    return (
      <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-blue-400 hover:border-red-500">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <Avatar className="h-16 w-16 mb-4">
            <AvatarFallback className="bg-blue-100 text-blue-800 text-xl font-bold">{logo}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg text-slate-800">{ngo.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{ngo.focus_area}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${ngo.email}`}>
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </CardContent>
      </Card>
    );
};

export default function NgoPortalPage() {
  const initialFormState = { name: '', regNumber: '', presidentName: '', secretaryName: '', focus: '', address: '', email: '', phone: '', website: '', description: '' };
  
  // --- STATE MANAGEMENT ---
  const [ngos, setNgos] = useState([]);
  const [formState, setFormState] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMessage, setFormMessage] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false); // State to control form visibility
  const registrationFormRef = useRef(null); // Ref to scroll to the form

  // --- DATA FETCHING ---
  const fetchNgos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5001/api/ngos');
      if (!response.ok) {
        throw new Error('Failed to fetch NGOs. Please try again later.');
      }
      const data = await response.json();
      setNgos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgos();
  }, []);
  
  // Scroll to the form when it becomes visible
  useEffect(() => {
    if (isFormVisible && registrationFormRef.current) {
        registrationFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isFormVisible]);

  // --- FORM HANDLING ---
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormState(prevState => ({ ...prevState, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(null); // Clear previous messages
    try {
      const response = await fetch('http://localhost:5001/api/ngos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || 'An error occurred during registration.');
      }
      
      setFormMessage({ type: 'success', text: result.msg || 'Thank You! Your registration has been submitted.' });
      setFormState(initialFormState); // Reset form
      fetchNgos(); // Refresh the list of NGOs

    } catch (err) {
      setFormMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-12 bg-slate-50 min-h-screen">
      <header className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full text-sm">
          <Handshake className="h-5 w-5" />
          <span>Partnership Program</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-800">
          NGO Partnership Portal
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Join our network of Non-Governmental Organizations to turn civic feedback into real-world action and build a better tomorrow together.
        </p>
      </header>

      {/* --- Roles Section --- */}
      <section>
        <div className="grid md:grid-cols-3 gap-6">
          <RoleCard icon={<Target className="h-8 w-8 text-blue-600" />} title="Focus on Key Issues" description="Collaborate to identify and concentrate on the social work that truly matters to the community." />
          <RoleCard icon={<Users className="h-8 w-8 text-blue-600" />} title="Expand Your Reach" description="Recruit dedicated volunteers and invigilators for your campaigns through our active citizen network." />
          <RoleCard icon={<Building className="h-8 w-8 text-blue-600" />} title="Enhance Rural Connectivity" description="Help us run impactful awareness campaigns in rural areas, bridging the urban-remote divide." />
        </div>
      </section>

      {/* --- Our Partners Section --- */}
      <section>
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">Our Esteemed Partners</h2>
          {loading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ngos.map(ngo => (<NgoCard key={ngo.id} ngo={ngo} />))}
            </div>
          )}
      </section>

      {/* --- Conditionally Rendered Registration Section --- */}
      {isFormVisible && (
        <section ref={registrationFormRef} className="max-w-4xl mx-auto pt-8">
            <Card className="border-t-4 border-blue-500 relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-slate-800">Become a Partner</CardTitle>
                <CardDescription>
                  Fill out the form below to begin the partnership process. Our team will review your application and get in touch.
                </CardDescription>
                <Button variant="ghost" size="icon" className="absolute top-3 right-3" onClick={() => setIsFormVisible(false)}>
                    <X className="h-6 w-6" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="name">NGO Name</Label><Input id="name" value={formState.name} onChange={handleInputChange} required /></div><div className="space-y-2"><Label htmlFor="regNumber">Official Registration Number</Label><Input id="regNumber" value={formState.regNumber} onChange={handleInputChange} required /></div></div>
                  <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="presidentName">President's Name</Label><Input id="presidentName" value={formState.presidentName} onChange={handleInputChange} required /></div><div className="space-y-2"><Label htmlFor="secretaryName">Secretary's Name</Label><Input id="secretaryName" value={formState.secretaryName} onChange={handleInputChange} required /></div></div>
                  <div className="space-y-2"><Label htmlFor="focus">Primary Focus Area</Label><Input id="focus" placeholder="e.g., Environmental, Healthcare, Education" value={formState.focus} onChange={handleInputChange} required /></div>
                  <div className="space-y-2"><Label htmlFor="address">Full Address</Label><Input id="address" value={formState.address} onChange={handleInputChange} required /></div>
                  <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="email">Contact Email</Label><Input id="email" type="email" value={formState.email} onChange={handleInputChange} required /></div><div className="space-y-2"><Label htmlFor="phone">Contact Phone</Label><Input id="phone" type="tel" value={formState.phone} onChange={handleInputChange} /></div></div>
                  <div className="space-y-2"><Label htmlFor="website">Website (Optional)</Label><Input id="website" type="url" placeholder="https://..." value={formState.website} onChange={handleInputChange} /></div>
                  <div className="space-y-2"><Label htmlFor="description">Brief Description</Label><Textarea id="description" placeholder="Tell us about your mission and key activities..." value={formState.description} onChange={handleInputChange} required /></div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Submit Registration</Button>
                  {formMessage && <p className={`text-sm text-center mt-4 ${formMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{formMessage.text}</p>}
                </form>
              </CardContent>
            </Card>
        </section>
      )}

      {/* --- Floating Action Button to show the form --- */}
      {!isFormVisible && (
        <Button 
          onClick={() => setIsFormVisible(true)} 
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl z-40 transform hover:scale-110 transition-transform"
        >
          <Plus className="h-8 w-8" />
        </Button>
      )}
    </div>
  );
}
