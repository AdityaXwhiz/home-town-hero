import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Mic, MapPin, LocateFixed, Siren, X, Square } from "lucide-react";
import potholeIcon from "@/assets/pothole-icon.jpg";
import streetlightIcon from "@/assets/streetlight-icon.jpg";
import litterIcon from "@/assets/litter-icon.jpg";

interface ReportDetails {
  potholeSize?: string;
  potholeDepth?: string;
  lightIssueType?: string;
  poleNumber?: string;
  binStatus?: string;
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

  // New state variables for audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const categories = [
    { id: "pothole", title: "Pothole", icon: potholeIcon },
    { id: "streetlight", title: "Streetlight", icon: streetlightIcon },
    { id: "litter", title: "Waste Bin", icon: litterIcon },
  ];

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setFormData({ ...formData, location: mapUrl, latitude, longitude, map_url: mapUrl });
      }, (error) => {
        console.error("Error getting location:", error);
        alert("Could not get your location. Please enter it manually or use localhost.");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleDeleteImage = (indexToDelete: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToDelete));
    setPreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToDelete));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combinedFiles = [...selectedFiles, ...newFiles].slice(0, 5);
      setSelectedFiles(combinedFiles);
      const newPreviews = combinedFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  // New functions for audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null); // Clear previous audio
    } catch (err) {
      console.error('Failed to get microphone access:', err);
      alert('Could not access microphone. Please ensure permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reportData = new FormData();
    reportData.append('category', activeCategory);
    reportData.append('name', formData.name);
    reportData.append('phone', formData.phone);
    reportData.append('location', formData.location);
    reportData.append('description', formData.description);
    if (formData.latitude !== null) reportData.append('latitude', String(formData.latitude));
    if (formData.longitude !== null) reportData.append('longitude', String(formData.longitude));
    reportData.append('map_url', formData.map_url);
    reportData.append('details', JSON.stringify(details));
    
    // Append the recorded audio file if it exists
    if (audioBlob) {
      reportData.append('voice_note', audioBlob, 'voice_note.webm');
    }
    
    if (selectedFiles.length > 0) {
      selectedFiles.forEach(file => {
        reportData.append('reportImages', file);
      });
    }

    try {
      const response = await fetch('http://localhost:5001/api/reports', {
        method: 'POST',
        body: reportData,
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.msg);
        setFormData({ name: "", phone: "", location: "", description: "", latitude: null, longitude: null, map_url: "" });
        setDetails({});
        setSelectedFiles([]);
        setPreviews([]);
        setAudioBlob(null); // Reset audio state
        setIsRecording(false); // Reset recording state
      } else {
        alert('Error: ' + result.msg);
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('An error occurred during submission.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Siren className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-foreground">Report a Community Issue</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-2">
          Provide detailed information to help us resolve the problem faster.
        </p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-auto">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="flex flex-col gap-2 p-4 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <img src={cat.icon} alt={cat.title} className="w-10 h-10 rounded-md object-cover" />
              <span className="font-semibold">{cat.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory}>
          <Card className="shadow-lg border-border/40">
            <CardHeader>
              <CardTitle className="text-2xl">Details for: {categories.find(c => c.id === activeCategory)?.title}</CardTitle>
              <CardDescription>Fill out the report details below.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  {activeCategory === 'pothole' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Pothole Size (Approx.)</Label>
                        <Select onValueChange={(value) => setDetails({ ...details, potholeSize: value })}><SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Pothole Depth</Label>
                        <Select onValueChange={(value) => setDetails({ ...details, potholeDepth: value })}><SelectTrigger><SelectValue placeholder="Select depth" /></SelectTrigger><SelectContent><SelectItem value="shallow">Shallow</SelectItem><SelectItem value="deep">Deep</SelectItem></SelectContent></Select>
                      </div>
                    </div>
                  )}
                  {activeCategory === 'streetlight' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>What is the issue?</Label>
                        <RadioGroup onValueChange={(value) => setDetails({ ...details, lightIssueType: value })}>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="out" id="r1" /><Label htmlFor="r1">Light is completely out</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="flickering" id="r2" /><Label htmlFor="r2">Light is flickering</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="on_day" id="r3" /><Label htmlFor="r3">Light is on during the day</Label></div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="poleNumber">Streetlight Pole Number (if visible)</Label>
                        <Input id="poleNumber" placeholder="e.g., P-12345" onChange={(e) => setDetails({...details, poleNumber: e.target.value})} />
                      </div>
                    </div>
                  )}
                  {activeCategory === 'litter' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>What is the status of the bin?</Label>
                        <RadioGroup onValueChange={(value) => setDetails({ ...details, binStatus: value })}>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="full" id="b1" /><Label htmlFor="b1">Bin is full</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="overflowing" id="b2" /><Label htmlFor="b2">Waste is overflowing</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="damaged" id="b3" /><Label htmlFor="b3">The bin is damaged</Label></div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Issue Location</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow"><MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Enter address or use GPS" className="pl-10" required /></div>
                    <Button type="button" variant="outline" onClick={handleLocation} className="shrink-0"><LocateFixed className="h-4 w-4 mr-2" />Use My Current Location</Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Photo Evidence (Up to 5 files)</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                          <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteImage(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {selectedFiles.length < 5 && (
                        <div className="border-2 border-dashed border-border rounded-lg flex flex-col justify-center items-center text-center cursor-pointer hover:border-primary aspect-square" onClick={() => fileInputRef.current?.click()}>
                          <Camera className="h-6 w-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">Add File</span>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                  </div>
                  <div className="space-y-2">
                    <Label>Record Voice Note (Optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-full flex flex-col justify-center items-center min-h-[112px]"
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      {isRecording ? (
                        <>
                          <Square className="h-8 w-8 text-red-500 mb-2" />
                          <span className="text-red-500">Stop Recording</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-muted-foreground">
                            {audioBlob ? "Record Again" : "Record Note"}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Additional Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Add any other relevant details..." />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your full name" required/></div>
                  <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Your phone number" required/></div>
                </div>
                
                <Button type="submit" className="w-full text-lg py-6">Submit Detailed Report</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};