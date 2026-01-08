"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, Grid, Plus, Circle, Square, Triangle, Hexagon, 
  Image as ImageIcon, Smile, CloudRain, Heart, Eye, EyeOff, Check, X 
} from "lucide-react";
import { clsx } from "clsx";

// --- Config ---
const SHAPE_ICONS: Record<string, any> = {
  circle: Circle, square: Square, triangle: Triangle, hexagon: Hexagon,
};

const EMOTION_ICONS = {
  laugh: { icon: Smile, color: "text-amber-400", bg: "bg-amber-400/20" },
  sad:   { icon: CloudRain, color: "text-blue-400", bg: "bg-blue-400/20" },
  love:  { icon: Heart, color: "text-rose-400", bg: "bg-rose-400/20" },
};

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [user, setUser] = useState<{ color: string; shape: string } | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Upload State
  const [uploadStep, setUploadStep] = useState(1); // 1: File, 2: Visibility & Confirm
  const [newPost, setNewPost] = useState<{
    file: string | null;
    isPublic: boolean;
  }>({ file: null, isPublic: true });
  const [isUploading, setIsUploading] = useState(false);

  // --- Auth & Fetch ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ color: payload.avatarColor, shape: payload.avatarShape });
      fetchPosts(token);
    } catch { router.push("/login"); }
  }, []);

  const fetchPosts = async (token: string) => {
    try {
      const res = await fetch("/api/posts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setPosts(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // --- Upload Logic ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost(prev => ({ ...prev, file: reader.result as string }));
        setUploadStep(2); // Skip Emotion, go straight to Visibility
      };
      reader.readAsDataURL(file);
    }
  };

  const submitUpload = async () => {
    setIsUploading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          image: newPost.file, 
          isPublic: newPost.isPublic 
        })
      });

      if (res.ok) {
        setIsUploadOpen(false);
        fetchPosts(token!); // Refresh grid
        // Reset state
        setNewPost({ file: null, isPublic: true });
        setUploadStep(1);
      }
    } catch (e) { console.error(e); }
    setIsUploading(false);
  };

  if (!user) return null;
  const UserShape = SHAPE_ICONS[user.shape] || Circle;

  return (
    <main className="min-h-screen w-full bg-black text-white relative">
      
      {/* HEADER */}
      <nav className="fixed top-0 z-40 flex w-full items-center justify-between px-6 py-6 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <button onClick={() => router.push("/feed?emotion=laugh")} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition">
          <Grid size={20} />
        </button>
        <button onClick={handleLogout} className="p-3 rounded-full bg-white/10 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 transition">
          <LogOut size={20} />
        </button>
      </nav>

      {/* CONTENT */}
      <div className="pt-24 px-6 pb-20 max-w-6xl mx-auto">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-16">
          <div className={clsx("flex h-32 w-32 items-center justify-center rounded-full shadow-2xl mb-6", user.color)}>
            <UserShape className="text-white/30" size={64} />
          </div>
          {/* Stats (Abstract) */}
          <div className="flex gap-2">
            {[...Array(3)].map((_,i) => <div key={i} className="h-2 w-2 rounded-full bg-zinc-800"/>)}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-center mb-12">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsUploadOpen(true)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-white/10"
          >
            <Plus size={32} />
          </motion.button>
        </div>

        {/* Image Grid */}
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="relative break-inside-avoid group overflow-hidden rounded-xl bg-zinc-900">
              <img src={post.url} className="w-full h-auto object-cover" loading="lazy" />
              {/* Overlay Metadata */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                {/* We show the emotion assigned by the system */}
                <div className={clsx("p-2 rounded-full", EMOTION_ICONS[post.emotion as keyof typeof EMOTION_ICONS]?.bg)}>
                  {(() => {
                    const Icon = EMOTION_ICONS[post.emotion as keyof typeof EMOTION_ICONS]?.icon || Smile;
                    return <Icon size={20} className={EMOTION_ICONS[post.emotion as keyof typeof EMOTION_ICONS]?.color} />;
                  })()}
                </div>
                {post.isPublic ? <Eye size={20} /> : <EyeOff size={20} className="text-zinc-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {isUploadOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-8 shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button onClick={() => setIsUploadOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                <X size={24} />
              </button>

              {/* STEP 1: SELECT FILE */}
              {uploadStep === 1 && (
                <div className="flex flex-col items-center gap-6 py-10">
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                  <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-32 w-32 items-center justify-center rounded-3xl bg-zinc-800 border-2 border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-white transition-colors"
                  >
                    <ImageIcon size={48} />
                  </motion.button>
                </div>
              )}

              {/* STEP 2: VISIBILITY & CONFIRM */}
              {uploadStep === 2 && (
                <div className="flex flex-col items-center gap-8 py-6">
                  {/* Preview */}
                  <div className="w-full h-40 rounded-2xl overflow-hidden bg-black relative">
                     {newPost.file && <img src={newPost.file} className="w-full h-full object-cover opacity-80" />}
                  </div>

                  {/* Controls */}
                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={() => setNewPost(p => ({ ...p, isPublic: true }))}
                      className={clsx(
                        "flex flex-1 flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                        newPost.isPublic ? "border-white bg-white/10 text-white" : "border-zinc-800 text-zinc-500"
                      )}
                    >
                      <Eye size={24} />
                    </button>
                    <button 
                      onClick={() => setNewPost(p => ({ ...p, isPublic: false }))}
                      className={clsx(
                        "flex flex-1 flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                        !newPost.isPublic ? "border-white bg-white/10 text-white" : "border-zinc-800 text-zinc-500"
                      )}
                    >
                      <EyeOff size={24} />
                    </button>
                  </div>

                  <button 
                    onClick={submitUpload}
                    disabled={isUploading}
                    className="w-full h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition"
                  >
                    {isUploading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"/> : <Check size={24} />}
                  </button>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}