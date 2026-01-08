import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid" }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: "Invalid" }, { status: 401 });
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                // Include visual identity in token so frontend can use it immediately
                avatarColor: user.avatarColor,
                avatarShape: user.avatarShape 
            },
            process.env.JWT_SECRET || "fallback-secret-dont-use-in-prod",
            { expiresIn: "1d" }
        );

        return NextResponse.json({ token });
        
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}