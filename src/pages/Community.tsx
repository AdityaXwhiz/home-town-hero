import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MessageCircle, Share2, Plus, X, Megaphone, AlertTriangle, Search, Wind, Image as ImageIcon } from "lucide-react";

// --- MOCK CURRENT USER ---
const currentUser = {
  name: "Aditya Singh",
  avatar: "AS",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=40&h=40&fit=crop&facepad=2&crop=faces"
};

// --- MOCK DATA with Unsplash images ---
const initialPosts = [
  { id: 1, type: 'user', author: "Sarah Johnson", avatar: "SJ", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=40&h=40&fit=crop&facepad=2&crop=faces", title: "Urgent: Pothole Epidemic on Maple Avenue", content: "The potholes on Maple Avenue have become a serious hazard for drivers and cyclists.", likes: 128, comments: 45, isLiked: false, time: "2h ago", severity: 'high', imageUrl: "https://images.unsplash.com/photo-1593489852824-1100994f3a74?q=80&w=600&h=400&fit=crop" },
  { id: 7, type: 'user', author: "Tom Richards", avatar: "TR", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=40&h=40&fit=crop&facepad=2&crop=faces", title: "Streetlight Outage on 5th and Main", content: "The entire block has been without streetlights for three nights. It's a major safety concern.", likes: 95, comments: 28, isLiked: false, time: "1d ago", severity: 'high', imageUrl: "https://images.unsplash.com/photo-1544923348-132895b6a718?q=80&w=600&h=400&fit=crop" },
  { id: 2, type: 'user', author: "Mike Chen", avatar: "MC", avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=40&h=40&fit=crop&facepad=2&crop=faces", title: "Success! New Lighting Installed at Central Park", content: "Fantastic news! The new eco-friendly LED lights have been installed. The park is now much safer for evening walks.", likes: 256, comments: 88, isLiked: true, time: "5h ago", imageUrl: "https://images.unsplash.com/photo-1611024822126-508a5b9c24d9?q=80&w=600&h=400&fit=crop" },
  { id: 4, type: 'user', author: "David Lee", avatar: "DL", avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=40&h=40&fit=crop&facepad=2&crop=faces", title: "Community Garden Initiative", content: "Let's turn the unused lot on Elm Street into a community garden! Looking for volunteers and ideas to get started.", likes: 150, comments: 75, isLiked: false, time: "2d ago", imageUrl: "https://images.unsplash.com/photo-1587838981498-fe198f5b8e93?q=80&w=600&h=400&fit=crop" },
  { id: 3, type: 'user', author: "Elena Rodriguez", avatar: "ER", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=40&h=40&fit=crop&facepad=2&crop=faces", title: "Discussion: Improving Public Transportation", content: "Our current bus routes don't adequately serve the new residential areas. Let's build a case together.", likes: 95, comments: 62, isLiked: false, time: "1d ago", imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c186f2e?q=80&w=600&h=400&fit=crop" },
  { id: 8, type: 'user', author: "Jessica White", avatar: "JW", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=40&h=40&fit=crop&facepad=2&crop=faces", title: "Idea for a Local Farmer's Market", content: "Wouldn't it be great to have a weekly farmer's market in the town square? It would support local agriculture.", likes: 88, comments: 41, isLiked: true, time: "3d ago", imageUrl: "https://images.unsplash.com/photo-1567342939102-1365076b92a2?q=80&w=600&h=400&fit=crop" },
  { id: 5, type: 'announcement', author: "City Council", avatar: "CC", avatarUrl: "https://images.unsplash.com/photo-1588507910523-911362547b36?q=80&w=40&h=40&fit=crop", title: "Public Hearing on New Zoning Laws", content: "A public hearing will be held on Oct 5th at City Hall to discuss proposed changes to residential zoning.", likes: 120, comments: 30, isLiked: false, time: "3d ago", imageUrl: "https://images.unsplash.com/photo-1560520655-5431e13543d8?q=80&w=600&h=400&fit=crop" },
  { id: 6, type: 'announcement', author: "Health Department", avatar: "HD", avatarUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=40&h=40&fit=crop", title: "Free Health Camp This Weekend", content: "Join us for a free health check-up camp at the Community Center on Saturday, from 9 AM to 5 PM.", likes: 180, comments: 40, isLiked: true, time: "4d ago", imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&h=400&fit=crop" },
];

const PostCard = ({ post, onLikeToggle }) => {
    const isAnnouncement = post.type === 'announcement';
    const isSevere = post.severity === 'high';

    const cardBaseStyle = "flex flex-col h-full overflow-hidden transition-shadow duration-300 group hover:shadow-lg rounded-lg";
    const cardBorderStyle = isAnnouncement 
        ? "border-t-4 border-blue-400" 
        : isSevere 
        ? "border-t-4 border-red-500"
        : "border";

    return (
        <Card className={`${cardBaseStyle} ${cardBorderStyle}`}>
            <div className="relative overflow-hidden">
                <img src={post.imageUrl} alt={post.title} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <CardHeader className="pt-4 pb-2">
                <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={post.avatarUrl} alt={post.author} />
                        <AvatarFallback className={isAnnouncement ? 'bg-blue-200 text-blue-800 font-semibold' : 'bg-gray-200 text-gray-700 font-semibold'}>{post.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-base font-bold leading-tight">{post.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                            Posted by <span className="font-semibold">{post.author}</span> • {post.time}
                        </CardDescription>
                    </div>
                    {isAnnouncement && <Megaphone className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                    {isSevere && <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between pt-2">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.content}</p>
                <div className="flex items-center gap-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => onLikeToggle(post.id)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                        <Star className={`h-4 w-4 transition-colors ${post.isLiked ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                        <span className="text-xs font-semibold">{post.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs font-semibold">{post.comments}</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto text-muted-foreground hover:text-foreground">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const CreatePostModal = ({ isOpen, onClose, onCreatePost }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            // Create a temporary URL for the image preview
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        if (!title || !content) return;
        onCreatePost(title, content, imagePreview); // Pass the preview URL
        
        // Reset form state
        setTitle(''); 
        setContent('');
        setImageFile(null);
        setImagePreview('');
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg animate-in fade-in-90 slide-in-from-bottom-10">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">Create a New Post<Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button></CardTitle>
                    <CardDescription>Share an issue, success story, or idea with the community.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="Enter a compelling title..." value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Description</Label>
                        <Textarea id="content" placeholder="Describe the situation in detail..." rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="postImage">Attach an Image (Optional)</Label>
                        <Input id="postImage" type="file" accept="image/*" onChange={handleImageChange} className="file:text-blue-700 file:font-semibold" />
                    </div>

                    {imagePreview && (
                        <div className="mt-4 rounded-md overflow-hidden border">
                            <img src={imagePreview} alt="Post preview" className="w-full h-auto object-cover max-h-48" />
                        </div>
                    )}
                    
                    <Button onClick={handleSubmit} className="w-full">Publish Post</Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default function CommunityBlogPage() {
    const [posts, setPosts] = useState(initialPosts);
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleCreatePost = (title, content, imageUrl) => {
        const newPost = { 
            id: Date.now(), 
            type: 'user', 
            author: currentUser.name, 
            avatar: currentUser.avatar, 
            avatarUrl: currentUser.avatarUrl, 
            title, 
            content, 
            likes: 0, 
            comments: 0, 
            isLiked: false, 
            time: "Just now", 
            imageUrl: imageUrl || "https://images.unsplash.com/photo-1526649661456-89c7ed4d00b8?q=80&w=600&h=400&fit=crop" // Use uploaded image or a default
        };
        setPosts([newPost, ...posts]);
    };

    const handleLikeToggle = (postId) => {
        setPosts(posts.map(post => post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post));
    };
    
    const filteredPosts = useMemo(() => {
        let currentPosts = posts;
        switch (activeTab) {
            case 'trending': currentPosts = posts.filter(p => p.likes > 100 && p.type === 'user'); break;
            case 'severe': currentPosts = posts.filter(p => p.severity === 'high'); break;
            case 'announcements': currentPosts = posts.filter(p => p.type === 'announcement'); break;
            default: currentPosts = posts;
        }
        if (searchTerm) {
            return currentPosts.filter(p => 
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.author.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return currentPosts;
    }, [activeTab, posts, searchTerm]);

    const TabButton = ({ tabName, label }) => (
        <Button variant={activeTab === tabName ? 'secondary' : 'ghost'} onClick={() => setActiveTab(tabName)} className="rounded-full px-4 h-9">{label}</Button>
    );

    return (
        <div className="bg-gray-50/50 min-h-screen">
            <div className="p-6 space-y-6 relative">
                <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Community Feed</h1>
                        <p className="text-muted-foreground text-sm">Welcome back, {currentUser.name}!</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search posts..." className="pl-9 h-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <Avatar>
                            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                            <AvatarFallback>{currentUser.avatar}</AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                <div className="border-b">
                    <div className="flex items-center space-x-1">
                        <TabButton tabName="all" label="All Posts" />
                        <TabButton tabName="trending" label="Trending" />
                        <TabButton tabName="severe" label="Severe Issues" />
                        <TabButton tabName="announcements" label="Announcements" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredPosts.map(post => (
                        <PostCard key={post.id} post={post} onLikeToggle={handleLikeToggle} />
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground col-span-full">
                        <Wind className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No posts found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                )}

                <Button onClick={() => setIsModalOpen(true)} className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-40">
                    <Plus className="h-8 w-8" />
                </Button>
                
                <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreatePost={handleCreatePost} />
            </div>
        </div>
    );
}

