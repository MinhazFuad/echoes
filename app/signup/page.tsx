"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mail, Lock, Check, Triangle, Circle, Square, Hexagon } from "lucide-react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

// --- Visual Assets ---
const AVATAR_COLORS = [
  "bg-gradient-to-br from-emerald-400 to-cyan-400",
  "bg-gradient-to-br from-indigo-400 to-purple-400",
  "bg-gradient-to-br from-rose-400 to-orange-400",
  "bg-gradient-to-br from-amber-200 to-yellow-500",
  "bg-gradient-to-br from-slate-200 to-slate-500",
];

const AVATAR_SHAPES = [
  { id: "circle", icon: Circle },
  { id: "square", icon: Square },
  { id: "triangle", icon: Triangle },
  { id: "hexagon", icon: Hexagon },
];

// --- Falling Confetti Component ---
const CelebrationParticles = () => {
  // Generate 50 particles
  const particles = Array.from({ length: 50 });
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((_, i) => {
        // Random properties for natural rain feel
        const randomX = Math.random() * 100; // 0% to 100% width
        const size = 8 + Math.random() * 12; // Random size
        const colorClass = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
        const duration = 2 + Math.random() * 2; // Fall speed (2s to 4s)
        const delay = Math.random() * 1.5; // Stagger start times

        return (
          <motion.div
            key={i}
            initial={{ 
              y: -50, // Start above screen
              x: `${randomX}vw`, 
              opacity: 0,
              rotate: 0 
            }}
            animate={{ 
              y: "110vh", // Fall to bottom
              opacity: [0, 1, 1, 0], // Fade in, stay, then fade out at end
              rotate: Math.random() > 0.5 ? 360 : -360 // Spin left or right
            }}
            transition={{ 
              duration: duration, 
              ease: "linear", // Constant fall speed
              delay: delay 
            }}
            className={clsx("absolute rounded-sm", colorClass)}
            style={{ width: size, height: size }}
          />
        );
      })}
    </div>
  );
};

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errorShake, setErrorShake] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [identity, setIdentity] = useState({ color: "", shape: "" });
  const [creds, setCreds] = useState({ email: "", password: "" });

  const handleNext = () => {
    if (!identity.color || !identity.shape) {
      setErrorShake(prev => prev + 1);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creds.email || !creds.password) {
      setErrorShake(prev => prev + 1);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: creds.email,
          password: creds.password,
          avatarColor: identity.color, 
          avatarShape: identity.shape 
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        // Wait for confetti (3s) then redirect
        setTimeout(() => {
            router.push("/login");
        }, 3000);
      } else {
        setErrorShake(prev => prev + 1); 
      }
    } catch (err) {
      setErrorShake(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-black p-6 relative overflow-hidden">
      
      {/* Falling Confetti (Only visible on success) */}
      {isSuccess && <CelebrationParticles />}

      <motion.div 
        key={errorShake}
        animate={errorShake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl border border-zinc-800"
      >
        <AnimatePresence mode="wait">
            {!isSuccess ? (
                // --- NORMAL FORM STATE ---
                <motion.div
                    key="form-container"
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Progress Bar */}
                    <div className="flex h-1 w-full">
                        <motion.div 
                            className="h-full bg-white" 
                            initial={{ width: "0%" }}
                            animate={{ width: step === 1 ? "50%" : "100%" }}
                        />
                    </div>

                    <div className="p-8 sm:p-12">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col gap-10"
                            >
                                {/* Avatar Preview */}
                                <div className="flex justify-center">
                                    <div className={clsx(
                                        "flex h-24 w-24 items-center justify-center transition-all duration-500",
                                        identity.color || "bg-zinc-800",
                                        identity.shape === "circle" && "rounded-full",
                                        identity.shape === "square" && "rounded-2xl",
                                        identity.shape === "triangle" && "rounded-none clip-triangle", 
                                        identity.shape === "hexagon" && "rounded-[20px]"
                                    )}>
                                        {identity.shape && (() => {
                                            const Icon = AVATAR_SHAPES.find(s => s.id === identity.shape)?.icon;
                                            return Icon ? <Icon className="text-white/50" size={32}/> : null;
                                        })()}
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex justify-center gap-4">
                                    {AVATAR_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setIdentity({ ...identity, color })}
                                            className={clsx(
                                                "h-10 w-10 rounded-full transition-all hover:scale-110",
                                                color,
                                                identity.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900" : "opacity-50 hover:opacity-100"
                                            )}
                                        />
                                    ))}
                                </div>

                                <div className="flex justify-center gap-6">
                                    {AVATAR_SHAPES.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setIdentity({ ...identity, shape: item.id })}
                                            className={clsx(
                                                "flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 transition-all",
                                                identity.shape === item.id ? "bg-white text-black scale-110" : "text-zinc-500 hover:bg-zinc-700 hover:text-white"
                                            )}
                                        >
                                            <item.icon size={24} />
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-white text-black transition-transform active:scale-95 hover:bg-zinc-200"
                                >
                                    <ArrowRight size={24} />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.form
                                key="step2"
                                onSubmit={handleSubmit}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col gap-6"
                            >
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={creds.email}
                                        onChange={(e) => setCreds({ ...creds, email: e.target.value })}
                                        className="h-14 w-full rounded-2xl bg-zinc-800 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-white/20"
                                    />
                                </div>

                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={creds.password}
                                        onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                                        className="h-14 w-full rounded-2xl bg-zinc-800 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-white/20"
                                    />
                                </div>

                                <button
                                    disabled={isLoading}
                                    type="submit"
                                    className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-white text-black transition-all active:scale-95 hover:bg-zinc-200 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <motion.div 
                                            animate={{ rotate: 360 }} 
                                            transition={{ repeat: Infinity, duration: 1 }} 
                                            className="h-5 w-5 rounded-full border-2 border-black border-t-transparent"
                                        />
                                    ) : (
                                        <Check size={24} />
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </div>
                </motion.div>
            ) : (
                // --- SUCCESS STATE (FIXED ANIMATION) ---
                <motion.div
                    key="success"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex h-96 w-full flex-col items-center justify-center gap-6"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        // FIX: Use single keyframe "1" and let spring handle the bounce
                        animate={{ scale: 1 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 200, 
                            damping: 10 // Low damping = Bouncy!
                        }}
                        className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40"
                    >
                        <Check size={48} strokeWidth={3} />
                    </motion.div>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg font-medium text-zinc-400"
                    >
            
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}