"use client";

import { useState } from "react";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    async function handleSignup() {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name })
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Signup failed:", text);
            alert("Signup failed");
            return;
        }

        const data = await res.json();
        alert("Signup successful! Now login.");
    }

    return (
        <div>
            <h2>Sign Up</h2>

            <input
                placeholder="Name (optional)"
                onChange={(e) => setName(e.target.value)}
            />

            <input
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleSignup}>Sign Up</button>
        </div>
    );
}
