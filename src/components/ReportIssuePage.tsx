import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Mic, MapPin, LocateFixed, Siren, X, Square, CheckCircle2, Building2 } from "lucide-react";
import potholeIcon from "@/assets/pothole-icon.jpg";
import streetlightIcon from "@/assets/streetlight-icon.jpg";
import litterIcon from "@/assets/litter-icon.jpg";

interface ReportDetails {
  // Pothole
  potholeSize?: string;
  potholeDepth?: string;
  potholeLocation?: string;
  trafficImpact?: string;
  causedAccident?: string;
  // Streetlight
  lightIssueType?: string;
  poleNumber?: string;
  poleLocation?: string;
  lightFlickerFrequency?: string;
  // Waste Bin
  binStatus?: string;
  wasteType?: string;
  binSmell?: string;
  binDamaged?: string;
  // Damaged Property
  propertyType?: string;
  damageSeverity?: string;
  causeOfDamage?: string;
}

export const ReportIssuePage = () => {
  const [activeCategory, setActiveCategory] = useState("pothole");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    description: "",
    latitude: null as number | null,
    longitude: null as number | null,
    map_url: "",
  });
  const [details, setDetails] = useState<ReportDetails>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State variables for audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const categories = [
    { id: "pothole", title: "Pothole", icon: potholeIcon, isIconComponent: false },
    { id: "streetlight", title: "Streetlight", icon: streetlightIcon, isIconComponent: false },
    { id: "litter", title: "Waste Bin", icon: litterIcon, isIconComponent: false },
    { id: "property", title: "Damaged Property", icon: Building2, isIconComponent: true },
  ];

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          setFormData({ ...formData, location: mapUrl, latitude, longitude, map_url: mapUrl });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please enter it manually or use localhost.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleDeleteImage = (indexToDelete: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToDelete));
    setPreviews((prevPreviews) => prevPreviews.filter((_, index) => index !== indexToDelete));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combinedFiles = [...selectedFiles, ...newFiles].slice(0, 5);
      setSelectedFiles(combinedFiles);
      const newPreviews = combinedFiles.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onloadedmetadata = () => {
          setAudioDuration(audio.duration);
        };

        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null);
      setAudioDuration(null);
    } catch (err) {
      console.error("Failed to get microphone access:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reportData = new FormData();
    reportData.append("category", activeCategory);
    reportData.append("name", formData.name);
    reportData.append("phone", formData.phone);
    reportData.append("location", formData.location);
    reportData.append("description", formData.description);
    if (formData.latitude !== null) reportData.append("latitude", String(formData.latitude));
    if (formData.longitude !== null) reportData.append("longitude", String(formData.longitude));
    reportData.append("map_url", formData.map_url);
    reportData.append("details", JSON.stringify(details));

    if (audioBlob) {
      reportData.append("voice_note", audioBlob, "voice_note.webm");
    }

    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        reportData.append("reportImages", file);
      });
    }

    try {
      const response = await fetch("http://localhost:5001/api/reports", {
        method: "POST",
        body: reportData,
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.msg);
        setFormData({ name: "", phone: "", location: "", description: "", latitude: null, longitude: null, map_url: "" });
        setDetails({});
        setSelectedFiles([]);
        setPreviews([]);
        setAudioBlob(null);
        setAudioDuration(null);
        setIsRecording(false);
      } else {
        alert("Error: " + result.msg);
      }
    } catch (error) {
      console.error("Failed to submit report:", error);
      alert("An error occurred during submission.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Siren className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Report a Community Issue</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-2">
          Provide detailed information to help us resolve the problem faster.
        </p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-4 mb-8 h-auto bg-muted p-1 rounded-lg">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="flex flex-col items-center justify-center gap-2 p-4 h-full text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-md transition-all"
            >
              {cat.isIconComponent ? (
                <cat.icon className="w-10 h-10" />
              ) : (
                <img src={cat.icon as string} alt={cat.title} className="w-10 h-10 rounded-md object-cover" />
              )}
              <span className="font-semibold text-sm">{cat.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory}>
          <Card className="shadow-2xl border-border/20 rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-2xl font-bold">Details for: {categories.find((c) => c.id === activeCategory)?.title}</CardTitle>
              <CardDescription>The more details you provide, the faster we can resolve it.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* --- Category Specific Questions --- */}
                <div className="p-6 bg-muted/50 rounded-lg border-l-4 border-primary space-y-6">
                  {activeCategory === "pothole" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><Label>Pothole Size (Approx.)</Label><Select onValueChange={(value) => setDetails({ ...details, potholeSize: value })}><SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Pothole Depth</Label><Select onValueChange={(value) => setDetails({ ...details, potholeDepth: value })}><SelectTrigger><SelectValue placeholder="Select depth" /></SelectTrigger><SelectContent><SelectItem value="shallow">Shallow</SelectItem><SelectItem value="deep">Deep</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Location of Pothole</Label><Select onValueChange={(value) => setDetails({ ...details, potholeLocation: value })}><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger><SelectContent><SelectItem value="road_center">Middle of the road</SelectItem><SelectItem value="road_edge">Edge of the road</SelectItem><SelectItem value="pavement">On the pavement</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Has it caused an accident?</Label><RadioGroup onValueChange={(value) => setDetails({ ...details, causedAccident: value })} className="flex items-center gap-4 pt-2"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="pa1" /><Label htmlFor="pa1">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="pa2" /><Label htmlFor="pa2">No</Label></div></RadioGroup></div>
                    </div>
                  )}
                  {activeCategory === "streetlight" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3"><Label>What is the issue?</Label><RadioGroup onValueChange={(value) => setDetails({ ...details, lightIssueType: value })}><div className="flex items-center space-x-2"><RadioGroupItem value="out" id="r1" /><Label htmlFor="r1">Light is out</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="flickering" id="r2" /><Label htmlFor="r2">Light is flickering</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="on_day" id="r3" /><Label htmlFor="r3">On during the day</Label></div></RadioGroup></div>
                      <div className="space-y-2"><Label htmlFor="poleNumber">Pole Number (if visible)</Label><Input id="poleNumber" placeholder="e.g., P-12345" onChange={(e) => setDetails({ ...details, poleNumber: e.target.value })} /></div>
                      <div className="space-y-2"><Label>If flickering, how often?</Label><Select onValueChange={(value) => setDetails({ ...details, lightFlickerFrequency: value })}><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger><SelectContent><SelectItem value="constant">Constantly</SelectItem><SelectItem value="intermittent">Intermittently</SelectItem><SelectItem value="rarely">Rarely</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Location of the Pole</Label><Select onValueChange={(value) => setDetails({ ...details, poleLocation: value })}><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger><SelectContent><SelectItem value="sidewalk">On the sidewalk</SelectItem><SelectItem value="median">In the road median</SelectItem><SelectItem value="park">In a park</SelectItem></SelectContent></Select></div>
                    </div>
                  )}
                  {activeCategory === "litter" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3"><Label>Status of the bin?</Label><RadioGroup onValueChange={(value) => setDetails({ ...details, binStatus: value })}><div className="flex items-center space-x-2"><RadioGroupItem value="full" id="b1" /><Label htmlFor="b1">Bin is full</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="overflowing" id="b2" /><Label htmlFor="b2">Overflowing</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="damaged" id="b3" /><Label htmlFor="b3">Damaged</Label></div></RadioGroup></div>
                      <div className="space-y-2"><Label>Primary type of waste?</Label><Select onValueChange={(value) => setDetails({ ...details, wasteType: value })}><SelectTrigger><SelectValue placeholder="Select waste type" /></SelectTrigger><SelectContent><SelectItem value="general">General Waste</SelectItem><SelectItem value="recycling">Recycling</SelectItem><SelectItem value="organic">Organic/Food Waste</SelectItem></SelectContent></Select></div>
                      <div className="space-y-3"><Label>If damaged, how?</Label><RadioGroup onValueChange={(value) => setDetails({ ...details, binDamaged: value })}><div className="flex items-center space-x-2"><RadioGroupItem value="graffiti" id="d1" /><Label htmlFor="d1">Graffiti</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="broken_lid" id="d2" /><Label htmlFor="d2">Broken Lid</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="missing" id="d3" /><Label htmlFor="d3">Missing</Label></div></RadioGroup></div>
                      <div className="space-y-3"><Label>Is there a strong smell?</Label><RadioGroup onValueChange={(value) => setDetails({ ...details, binSmell: value })} className="flex items-center gap-4 pt-2"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="sm1" /><Label htmlFor="sm1">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="sm2" /><Label htmlFor="sm2">No</Label></div></RadioGroup></div>
                    </div>
                  )}
                  {activeCategory === "property" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><Label>What property is damaged?</Label><Select onValueChange={(value) => setDetails({ ...details, propertyType: value })}><SelectTrigger><SelectValue placeholder="Select property type" /></SelectTrigger><SelectContent><SelectItem value="bench">Public Bench</SelectItem><SelectItem value="fence">Fence/Railing</SelectItem><SelectItem value="signage">Public Signage</SelectItem><SelectItem value="playground">Playground Equipment</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Severity of Damage</Label><Select onValueChange={(value) => setDetails({ ...details, damageSeverity: value })}><SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger><SelectContent><SelectItem value="minor">Minor</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="severe">Severe</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2 md:col-span-2"><Label>Suspected cause of damage?</Label><Select onValueChange={(value) => setDetails({ ...details, causeOfDamage: value })}><SelectTrigger><SelectValue placeholder="Select cause" /></SelectTrigger><SelectContent><SelectItem value="vandalism">Vandalism</SelectItem><SelectItem value="wear_and_tear">Wear and Tear</SelectItem><SelectItem value="accident">Accident</SelectItem><SelectItem value="unknown">Unknown</SelectItem></SelectContent></Select></div>
                    </div>
                  )}
                </div>

                {/* --- Common Fields --- */}
                <div className="space-y-2">
                  <Label htmlFor="location">Issue Location</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Enter address or use GPS" className="pl-10 h-11" required /></div>
                    <Button type="button" variant="outline" onClick={handleLocation} className="shrink-0 h-11"><LocateFixed className="h-4 w-4 mr-2" />Use My Location</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo Evidence */}
                  <div className="space-y-2">
                    <Label>Photo Evidence (Up to 5)</Label>
                    <div
                      className="group relative border-2 border-dashed border-border rounded-lg flex flex-col justify-center items-center text-center cursor-pointer min-h-[160px] p-4 transition-colors hover:border-green-500 hover:bg-green-500/10"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previews.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 w-full">
                          {previews.map((preview, index) => (
                            <div key={index} className="relative aspect-square">
                              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md shadow" />
                              <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={(e) => { e.stopPropagation(); handleDeleteImage(index); }}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {selectedFiles.length < 5 && (
                            <div className="flex flex-col justify-center items-center text-muted-foreground group-hover:text-green-600 aspect-square">
                              <Camera className="h-8 w-8 mb-1" />
                              <span className="text-xs font-semibold">Add More</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center items-center text-muted-foreground group-hover:text-green-600">
                          <Camera className="h-8 w-8 mb-2" />
                          <span className="text-sm font-semibold">Click to Add Files</span>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                  </div>

                  {/* Voice Note */}
                  <div className="space-y-2">
                    <Label>Record Voice Note (Optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-full flex flex-col justify-center items-center min-h-[160px] text-center rounded-lg"
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      {isRecording ? (
                        <>
                          <Square className="h-8 w-8 text-red-500 mb-2 animate-pulse" />
                          <span className="text-red-500 font-semibold">Stop Recording</span>
                        </>
                      ) : audioBlob ? (
                        <>
                          <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                          <span className="text-green-500 font-semibold">Note Recorded ({formatDuration(audioDuration)})</span>
                          <span className="text-xs text-muted-foreground mt-1">Click to Record Again</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-muted-foreground font-semibold">Record a Voice Note</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Additional Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Add any other relevant details..." className="min-h-[100px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your full name" required className="h-11" /></div>
                  <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Your phone number" required className="h-11" /></div>
                </div>

                <Button type="submit" className="w-full text-lg py-6 font-bold tracking-wider hover:scale-[1.02] transition-transform">
                  Submit Detailed Report
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};