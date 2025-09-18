import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MessageCircle, Share2, Plus, X, Megaphone, AlertTriangle, Search, Wind, Image as ImageIcon, Loader2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns'; // <-- 1. IMPORT THE NEW FUNCTION

// --- MOCK CURRENT USER (can be replaced with real auth data) ---
const currentUser = {
  name: "Aditya Singh",
  avatar: "AS",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=40&h=40&fit=crop&facepad=2&crop=faces"
};

const PostCard = ({ post, onLikeToggle }) => {
    const isAnnouncement = post.is_announcement;
    const isSevere = post.severity === 'high';
    
    // Construct the full URL for images served from the backend
    const imageUrl = post.image_url ? `http://localhost:5001${post.image_url}` : "https://images.unsplash.com/photo-1526649661456-89c7ed4d00b8?q=80&w=600&h=400&fit=crop";
    
    // --- 2. UPDATED, MORE RELIABLE timeAgo FUNCTION ---
    const timeAgo = (date) => {
        if (!date) {
            return "a moment ago"; 
        }
        try {
            // Use the robust date-fns library to handle formatting
            return `${formatDistanceToNow(new Date(date))} ago`;
        } catch (error) {
            console.error("Could not format date:", date, error);
            return "a moment ago"; // Safe fallback
        }
    };

    return (
        <Card className={`flex flex-col h-full overflow-hidden transition-shadow duration-300 group hover:shadow-lg rounded-lg ${isAnnouncement ? 'border-t-4 border-blue-400' : isSevere ? 'border-t-4 border-red-500' : 'border'}`}>
            <div className="relative overflow-hidden">
                <img src={imageUrl} alt={post.title} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <CardHeader className="pt-4 pb-2">
                <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className={isAnnouncement ? 'bg-blue-200 text-blue-800 font-semibold' : 'bg-gray-200 text-gray-700 font-semibold'}>{post.author_avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-base font-bold leading-tight">{post.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                            Posted by <span className="font-semibold">{post.author_name}</span> • {timeAgo(post.created_at)}
                        </CardDescription>
                    </div>
                    {isAnnouncement && <Megaphone className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                    {isSevere && <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between pt-2">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.content}</p>
                <div className="flex items-center gap-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => onLikeToggle(post.id, post.isLiked)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!title || !content) return;
        setIsSubmitting(true);
        await onCreatePost(title, content, imageFile);
        
        setIsSubmitting(false);
        setTitle(''); 
        setContent('');
        setImageFile(null);
        setImagePreview('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg animate-in fade-in-90 slide-in-from-bottom-10">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">Create a New Post<Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button></CardTitle>
                    <CardDescription>Share an issue, success story, or idea with the community.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" placeholder="Enter a compelling title..." value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="content">Description</Label><Textarea id="content" placeholder="Describe the situation in detail..." rows={5} value={content} onChange={(e) => setContent(e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="postImage">Attach an Image (Optional)</Label><Input id="postImage" type="file" accept="image/*" onChange={handleImageChange} className="file:text-blue-700 file:font-semibold" /></div>
                    {imagePreview && <div className="mt-4 rounded-md overflow-hidden border"><img src={imagePreview} alt="Post preview" className="w-full h-auto object-cover max-h-48" /></div>}
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Post"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default function CommunityBlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPosts = async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await fetch('http://localhost:5001/api/posts');
            if (!response.ok) throw new Error('Failed to fetch posts from the server.');
            const data = await response.json();
            setPosts(data.map(post => ({ ...post, isLiked: false }))); // isLiked is managed locally
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreatePost = async (title, content, imageFile) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('author_name', currentUser.name);
        formData.append('author_avatar', currentUser.avatar);
        if (imageFile) {
            formData.append('postImage', imageFile);
        }

        try {
            const response = await fetch('http://localhost:5001/api/posts', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.msg || 'Failed to create post.');
            }
            await fetchPosts(); // Refresh posts list
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleLikeToggle = async (postId, isCurrentlyLiked) => {
        setPosts(posts.map(post => 
            post.id === postId ? { ...post, isLiked: !post.isLiked, likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1 } : post
        ));
        
        try {
            // NOTE: The backend only supports incrementing likes. A real implementation would need more logic for toggling.
            if (!isCurrentlyLiked) {
                 await fetch(`http://localhost:5001/api/posts/${postId}/like`, { method: 'PUT' });
            }
        } catch (err) {
            console.error("Failed to update like status:", err);
            // Revert UI on error
             setPosts(posts.map(post => 
                post.id === postId ? { ...post, isLiked: isCurrentlyLiked, likes: isCurrentlyLiked ? post.likes + 1 : post.likes - 1 } : post
            ));
        }
    };
    
    const filteredPosts = useMemo(() => {
        let currentPosts = posts;
        switch (activeTab) {
            case 'trending': currentPosts = posts.filter(p => p.likes > 100 && !p.is_announcement); break;
            case 'severe': currentPosts = posts.filter(p => p.severity === 'high'); break;
            case 'announcements': currentPosts = posts.filter(p => p.is_announcement); break;
            default: currentPosts = posts;
        }
        if (searchTerm) {
            return currentPosts.filter(p => 
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.author_name.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search posts..." className="pl-9 h-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                        <Avatar><AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} /><AvatarFallback>{currentUser.avatar}</AvatarFallback></Avatar>
                    </div>
                </header>

                <div className="border-b"><div className="flex items-center space-x-1"><TabButton tabName="all" label="All Posts" /><TabButton tabName="trending" label="Trending" /><TabButton tabName="severe" label="Severe Issues" /><TabButton tabName="announcements" label="Announcements" /></div></div>
                
                {loading && <div className="text-center py-16"><Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" /></div>}
                {error && <div className="text-center py-16 text-red-500 font-semibold">{error}</div>}

                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {filteredPosts.map(post => ( <PostCard key={post.id} post={post} onLikeToggle={handleLikeToggle} /> ))}
                    </div>
                )}

                {!loading && !error && filteredPosts.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground col-span-full">
                        <Wind className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No posts found</h3>
                        <p>Try adjusting your search or filters, or be the first to post!</p>
                    </div>
                )}

                <Button onClick={() => setIsModalOpen(true)} className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-40"><Plus className="h-8 w-8" /></Button>
                
                <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreatePost={handleCreatePost} />
            </div>
        </div>
    );
}

