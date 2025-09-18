import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Star, MessageCircle, Share2, TrendingUp, PlusCircle } from "lucide-react";

// --- MOCK DATA FOR BLOG POSTS (with 'isLiked' state) ---
const initialPosts = [
  {
    id: 1,
    author: "Sarah Johnson",
    avatar: "SJ",
    title: "Urgent: Pothole Epidemic on Maple Avenue",
    content: "The potholes on Maple Avenue have become a serious hazard for drivers and cyclists. I've documented several near-accidents this week alone. We need the city to prioritize this repair before someone gets hurt. I've attached images in my report.",
    category: "Road Safety",
    likes: 48,
    comments: 16,
    shares: 9,
    isLiked: false, // <-- New property for like state
    time: "2 hours ago"
  },
  {
    id: 2,
    author: "Mike Chen",
    avatar: "MC", 
    title: "Success! New Lighting Installed at Central Park",
    content: "Fantastic news for our community! After months of reporting and discussion, the new eco-friendly LED lights have been installed throughout Central Park. The area is now much safer for evening walks. A big thank you to the local council and everyone who supported this initiative.",
    category: "Success Story",
    likes: 72,
    comments: 22,
    shares: 15,
    isLiked: true, // <-- Example of an already-liked post
    time: "5 hours ago"
  },
  {
    id: 3,
    author: "Elena Rodriguez",
    avatar: "ER",
    title: "Discussion: Improving Public Transportation Routes",
    content: "Our current bus routes don't adequately serve the new residential areas in the west end. This leads to overcrowding and long wait times. I propose we petition for a revised route plan. What are your thoughts and suggestions? Let's build a case together.",
    category: "Public Transport",
    likes: 61,
    comments: 35,
    shares: 11,
    isLiked: false,
    time: "1 day ago"
  }
];

export default function CommunityBlogPage() {
    const [posts, setPosts] = useState(initialPosts);
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");

    const handleCreatePost = () => {
        if (!newPostTitle || !newPostContent) return;
        const newPost = {
            id: posts.length + 1,
            author: "Current User", // Replace with actual user data
            avatar: "CU",
            title: newPostTitle,
            content: newPostContent,
            category: "General",
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false,
            time: "Just now"
        };
        setPosts([newPost, ...posts]);
        setNewPostTitle("");
        setNewPostContent("");
    };

    const handleLikeToggle = (postId: number) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    isLiked: !post.isLiked,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                };
            }
            return post;
        }));
    };


  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Civic Blog & Issue Tracker</h1>
        <p className="text-muted-foreground mt-2">Create posts, discuss issues, and vote on what matters most.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* --- CREATE NEW POST FORM --- */}
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <PlusCircle className="h-5 w-5" />
                      Create a New Post
                  </CardTitle>
                  <CardDescription>Share an issue or an idea with the community.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <Input 
                      placeholder="Title of your post..." 
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                  <Textarea 
                      placeholder="Describe the issue or your idea in detail..." 
                      rows={5}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  <Button onClick={handleCreatePost}>Submit Post</Button>
              </CardContent>
          </Card>

          {/* --- BLOG POSTS FEED --- */}
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{post.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base">{post.author}</CardTitle>
                    <CardDescription>{post.time}</CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {post.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t">
                  {/* --- NEW INTERACTIVE LIKE BUTTON --- */}
                  <Button variant="ghost" size="sm" onClick={() => handleLikeToggle(post.id)}>
                      <Star className={`h-4 w-4 mr-2 transition-colors ${post.isLiked ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
                      {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      {post.shares}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* --- SIDEBAR --- */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Members</span>
                <span className="font-semibold">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Issues Resolved</span>
                <span className="font-semibold">856</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-semibold text-green-600">+23%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">#RoadSafety</Badge>
                <Badge variant="secondary">#ParkCleanup</Badge>
                <Badge variant="secondary">#PublicTransport</Badge>
                <Badge variant="secondary">#StreetLights</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

