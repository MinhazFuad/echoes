"use client";

import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin() {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Login failed:", text);
            alert("Login failed");
            return;
        }

        const data = await res.json();

        if (!data.token) {
            alert("No token returned");
            return;
        }

        localStorage.setItem("token", data.token);
        alert("Logged in!");
    }

    return (
        <div>
            <input
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}
