"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // States for feedback and animation
    const [errorShake, setErrorShake] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                // Error: Shake and reset loading
                setErrorShake(prev => prev + 1);
                setIsLoading(false);
                return;
            }

            const data = await res.json();
            
            // Success Logic
            localStorage.setItem("token", data.token);
            setIsSuccess(true); // Trigger exit animation

            // Wait for animation (800ms) then redirect
            setTimeout(() => {
                router.push("/dashboard");
            }, 800);

        } catch (error) {
            setErrorShake(prev => prev + 1);
            setIsLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-black p-6 overflow-hidden">
            <AnimatePresence>
                {!isSuccess ? (
                    <motion.form
                        key="login-form"
                        // Error Shake Animation
                        animate={errorShake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
                        // Exit Animation (Success)
                        exit={{ 
                            opacity: 0, 
                            scale: 0.95, 
                            filter: "blur(10px)",
                            transition: { duration: 0.8, ease: "easeInOut" } 
                        }}
                        transition={{ duration: 0.4 }}
                        onSubmit={handleLogin}
                        className="flex w-full max-w-sm flex-col gap-6 rounded-3xl bg-zinc-900 p-8 shadow-2xl border border-zinc-800"
                    >
                        {/* Visual Header */}
                        <div className="mb-4 flex justify-center text-zinc-700">
                            <Lock size={48} strokeWidth={1} />
                        </div>

                        {/* Email Input */}
                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white">
                                <Mail size={20} />
                            </div>
                            <input
                                placeholder=" "
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 w-full rounded-2xl bg-zinc-950 pl-12 pr-4 text-white outline-none ring-1 ring-zinc-800 transition-all focus:ring-2 focus:ring-white/20"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white">
                                <Lock size={20} />
                            </div>
                            <input
                                placeholder=" " 
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 w-full rounded-2xl bg-zinc-950 pl-12 pr-4 text-white outline-none ring-1 ring-zinc-800 transition-all focus:ring-2 focus:ring-white/20"
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="mt-2 flex h-14 w-full items-center justify-center rounded-full bg-white text-black transition-all active:scale-95 hover:bg-zinc-200 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <motion.div 
                                    animate={{ rotate: 360 }} 
                                    transition={{ repeat: Infinity, duration: 1 }} 
                                    className="h-5 w-5 rounded-full border-2 border-black border-t-transparent"
                                />
                            ) : (
                                <LogIn size={24} />
                            )}
                        </button>
                    </motion.form>
                ) : (
                    // Optional: A transient success icon that appears briefly before redirect
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute flex items-center justify-center rounded-full bg-white/10 p-8 text-emerald-400 backdrop-blur-md"
                    >
                        <Check size={48} strokeWidth={3} />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}