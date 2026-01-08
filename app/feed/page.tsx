"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, Plus, LogIn, UserPlus, Smile, CloudRain, Heart, X, Circle, Square, Triangle, Hexagon } from "lucide-react"; 
import { clsx } from "clsx";

// --- Configuration ---
const EMOTION_ICONS = {
  laugh: { icon: Smile, color: "text-amber-400", from: "from-amber-400", to: "to-orange-500" },
  sad:   { icon: CloudRain, color: "text-blue-400", from: "from-blue-400", to: "to-indigo-500" },
  love:  { icon: Heart, color: "text-rose-400", from: "from-rose-400", to: "to-pink-600" },
};

const SHAPE_ICONS: Record<string, any> = {
  circle: Circle, square: Square, triangle: Triangle, hexagon: Hexagon,
};

// --- Types ---
type EmotionType = "laugh" | "sad" | "love";

interface FeedPost {
  id: number;
  url: string;
  originalEmotion: EmotionType;
  height: string;
  // Dummy interaction data
  myReaction: EmotionType | null; 
}

// --- Dummy Data Factory ---
const generateDummyData = (filterEmotion: string | null): FeedPost[] => {
  const allImages: FeedPost[] = Array.from({ length: 24 }).map((_, i) => {
    const emotions: EmotionType[] = ["laugh", "sad", "love"];
    return {
      id: i,
      url: `https://picsum.photos/seed/${i + 100}/600/${i % 2 === 0 ? "800" : "600"}`, // High res for modal
      originalEmotion: emotions[i % 3],
      height: i % 2 === 0 ? "aspect-[2/3]" : "aspect-square",
      myReaction: null, // Default: no reaction
    };
  });

  if (filterEmotion) {
    return allImages.filter((img) => img.originalEmotion === filterEmotion);
  }
  return allImages;
};

// --- Header Component ---
function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ color: string; shape: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ color: payload.avatarColor, shape: payload.avatarShape });
      } catch {}
    }
  }, []);

  const UserShape = user ? SHAPE_ICONS[user.shape] || Circle : Circle;

  return (
    <nav className="absolute top-0 z-40 flex w-full items-center justify-between px-6 py-4 pointer-events-none">
      {/* Grid Icon */}
      <button onClick={() => router.push("/")} className="pointer-events-auto rounded-full bg-black/20 backdrop-blur-md p-3 text-white hover:bg-white/20 transition">
        <Grid size={24} strokeWidth={1.5} />
      </button>

      {/* Right Actions */}
      <div className="flex gap-4 pointer-events-auto">
        {user ? (
          <>
            <button onClick={() => router.push("/dashboard")} className="rounded-full bg-black/20 backdrop-blur-md p-3 text-white hover:bg-white/20 transition">
              <Plus size={24} strokeWidth={1.5} />
            </button>
            <button onClick={() => router.push("/dashboard")} className={clsx("h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition hover:scale-105", user.color)}>
               <UserShape size={20} className="text-white/50" />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => router.push("/login")} className="rounded-full bg-black/20 backdrop-blur-md p-3 text-white hover:bg-white/20 transition">
                <LogIn size={24} strokeWidth={1.5} />
            </button>
            <button onClick={() => router.push("/signup")} className="rounded-full bg-white p-3 text-black hover:scale-105 transition">
                <UserPlus size={24} strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

// --- Main Feed Content ---
function FeedContent() {
  const searchParams = useSearchParams();
  const emotionParam = searchParams.get("emotion");
  
  // State
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);

  // Init Data
  useEffect(() => {
    setPosts(generateDummyData(emotionParam));
  }, [emotionParam]);

  // Handle Dummy React (Local State Only)
  const handleReact = (postId: number, type: EmotionType) => {
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          // Toggle off if same, otherwise switch
          const newReaction = post.myReaction === type ? null : type;
          
          // Also update selectedPost if it's open so the UI refreshes instantly
          if (selectedPost?.id === postId) {
            setSelectedPost({ ...post, myReaction: newReaction });
          }
          return { ...post, myReaction: newReaction };
        }
        return post;
      })
    );
  };

  const getAmbientColor = () => {
    switch (emotionParam) {
      case "laugh": return "bg-gradient-to-b from-[#1a1500] to-black"; 
      case "sad": return "bg-gradient-to-b from-[#0a1520] to-black"; 
      case "love": return "bg-gradient-to-b from-[#1a0505] to-black"; 
      default: return "bg-black";
    }
  };

  return (
    <div className={clsx("relative h-screen w-full overflow-hidden transition-colors duration-1000", getAmbientColor())}>
      
      <Header />

      {/* SCROLLABLE GRID */}
      <div className="h-full w-full overflow-y-auto pt-24 pb-20 px-4 md:px-8 scrollbar-hide">
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4 space-y-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="break-inside-avoid cursor-pointer"
              onClick={() => setSelectedPost(post)}
              whileHover={{ scale: 1.02 }}
            >
              <div className={clsx("relative w-full overflow-hidden rounded-xl bg-white/5", post.height)}>
                <img
                  src={post.url}
                  alt="Silent emotion"
                  className="h-full w-full object-cover transition-opacity duration-300 hover:opacity-90"
                  loading="lazy"
                />
                
                {/* Mini Reaction Indicator (Show if user reacted) */}
                {post.myReaction && (
                    <div className="absolute top-2 right-2 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
                        {(() => {
                             const Icon = EMOTION_ICONS[post.myReaction].icon;
                             return <Icon size={14} className={EMOTION_ICONS[post.myReaction].color} />;
                        })()}
                    </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FULLSCREEN IMMERSIVE MODAL */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6"
            onClick={() => setSelectedPost(null)} // Click outside to close
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-50"
            >
              <X size={24} />
            </button>

            <div 
                className="relative w-full max-w-4xl h-full max-h-[85vh] flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()} // Prevent close when clicking content
            >
              {/* Main Image */}
              <motion.img 
                layoutId={`img-${selectedPost.id}`}
                src={selectedPost.url} 
                className="max-h-[65vh] w-auto rounded-lg shadow-2xl object-contain"
              />

              {/* Reaction Dock */}
              <div className="mt-10 flex gap-8">
                {(Object.keys(EMOTION_ICONS) as EmotionType[]).map((key) => {
                  const Config = EMOTION_ICONS[key];
                  const isActive = selectedPost.myReaction === key;
                  
                  return (
                    <motion.button
                      key={key}
                      onClick={() => handleReact(selectedPost.id, key)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className={clsx(
                        "relative flex flex-col items-center justify-center h-20 w-20 rounded-full border-2 transition-all duration-300",
                        isActive 
                          ? `border-transparent bg-gradient-to-tr ${Config.from} ${Config.to} shadow-[0_0_30px_rgba(255,255,255,0.3)]`
                          : "border-white/10 bg-white/5 text-white/30 hover:border-white/50 hover:text-white"
                      )}
                    >
                      <Config.icon size={32} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-white" : ""} />
                      {isActive && (
                          <motion.div 
                            layoutId="active-glow" 
                            className="absolute inset-0 rounded-full blur-xl bg-white/40" 
                            transition={{ duration: 0.3 }}
                          />
                      )}
                    </motion.button>
                  );
                })}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-black" />}>
      <FeedContent />
    </Suspense>
  );
}