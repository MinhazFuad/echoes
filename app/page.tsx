"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, TargetAndTransition } from "framer-motion";
import { Smile, CloudRain, Heart, LogIn, Circle, Square, Triangle, Hexagon, LucideIcon } from "lucide-react"; 
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

// --- Configuration ---
type EmotionConfig = {
  id: string;
  color: string;
  icon: LucideIcon;
  animation: TargetAndTransition;
};

// Shape mapping for the avatar
const SHAPE_ICONS: Record<string, any> = {
  circle: Circle,
  square: Square,
  triangle: Triangle,
  hexagon: Hexagon,
};

const EMOTIONS: Record<string, EmotionConfig> = {
  laugh: {
    id: "laugh",
    // Vivid Amber to Deep Orange
    color: "from-[#FFD600] to-[#FF4500]", 
    icon: Smile,
    animation: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
      transition: { 
        duration: 0.6, 
        ease: "easeInOut", 
        repeat: Infinity, 
        repeatDelay: 0.1 
      },
    },
  },
  sad: {
    id: "sad",
    // Deep Midnight to Electric Blue
    color: "from-[#0F2027] via-[#203A43] to-[#2C5364]", 
    icon: CloudRain,
    animation: {
      y: [0, 10, 0],
      scale: [1, 0.95, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 3, ease: "easeInOut", repeat: Infinity },
    },
  },
  love: {
    id: "love",
    // Blood Red to Hot Magenta
    color: "from-[#D31027] to-[#EA384D]", 
    icon: Heart,
    animation: {
      scale: [1, 1.2, 1],
      filter: ["drop-shadow(0 0 0px #ff0000)", "drop-shadow(0 0 15px #ff0000)", "drop-shadow(0 0 0px #ff0000)"],
      transition: { duration: 0.8, ease: "easeInOut", repeat: Infinity },
    },
  },
};

type EmotionKey = keyof typeof EMOTIONS;

export default function LandingPage() {
  const [selected, setSelected] = useState<EmotionKey | null>(null);
  const [user, setUser] = useState<{ color: string; shape: string } | null>(null);
  const router = useRouter();

  // --- Auth Check ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.avatarColor && payload.avatarShape) {
          setUser({ color: payload.avatarColor, shape: payload.avatarShape });
        }
      } catch (e) {
        console.error("Auth check failed", e);
      }
    }
  }, []);

  const handleSelect = (emotion: EmotionKey) => {
    setSelected(emotion);
    setTimeout(() => {
      router.push(`/feed?emotion=${emotion}`);
    }, 1500);
  };

  const UserShape = user ? SHAPE_ICONS[user.shape] || Circle : Circle;

  return (
    <main className="relative flex h-screen w-screen items-center justify-center bg-black overflow-hidden">
      
      {/* LAYER 0: The Header (Auth & Actions) */}
      <nav className="absolute top-0 right-0 z-50 p-6 sm:p-8">
        {user ? (
          // Logged In: Show Avatar -> Dashboard
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push("/dashboard")}
            className={clsx(
              "flex h-12 w-12 items-center justify-center rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-white/10",
              user.color
            )}
          >
            <UserShape className="text-white/80" size={20} strokeWidth={2} />
          </motion.button>
        ) : (
          // Guest: Show Login Icon
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push("/login")}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 backdrop-blur-md transition-colors hover:text-white hover:border-white/30"
          >
            <LogIn size={20} strokeWidth={1.5} />
          </motion.button>
        )}
      </nav>

      {/* LAYER 1: The Cinematic Expansion */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="expansion-circle"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 45, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.5, 
              ease: [0.4, 0, 0.2, 1] 
            }}
            className={clsx(
              "absolute inset-0 z-10 m-auto h-20 w-20 rounded-full bg-gradient-to-br blur-xl",
              EMOTIONS[selected].color
            )}
          />
        )}
      </AnimatePresence>

      {/* LAYER 2: The Icons */}
      <motion.div 
        className="relative z-20 flex gap-8 sm:gap-20"
        animate={selected ? { opacity: 0, scale: 0.5, y: 50 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "backIn" }}
      >
        {(Object.keys(EMOTIONS) as EmotionKey[]).map((key) => {
          const emotion = EMOTIONS[key];
          const Icon = emotion.icon;
          const hoverAnim = !selected ? emotion.animation : {};

          return (
            <motion.button
              key={key}
              onClick={() => handleSelect(key)}
              whileHover={hoverAnim}
              whileTap={{ scale: 0.85 }}
              className="group relative flex flex-col items-center justify-center outline-none"
            >
              <div
                className={clsx(
                  "flex h-24 w-24 items-center justify-center rounded-full border-2 transition-all duration-500 sm:h-32 sm:w-32",
                  "border-white/10 bg-white/5 text-white/40 backdrop-blur-sm",
                  "group-hover:border-white/90 group-hover:text-white group-hover:bg-white/10 group-hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]"
                )}
              >
                <Icon
                  size={48}
                  strokeWidth={1}
                  className="transition-transform duration-300"
                />
              </div>

              {/* The "Soul" Dot */}
              <div 
                className={clsx(
                  "absolute -bottom-6 h-2 w-2 rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150 shadow-[0_0_10px_currentColor]",
                  "bg-gradient-to-r",
                  emotion.color
                )} 
              />
            </motion.button>
          );
        })}
      </motion.div>
    </main>
  );
}