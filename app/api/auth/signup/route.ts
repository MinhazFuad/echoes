import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, avatarColor, avatarShape } = body;

        // Validate strictly
        if (!email || !password || !avatarColor || !avatarShape) {
            return NextResponse.json(
                { error: "Missing identity fields" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User exists" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                avatarColor,
                avatarShape,
                // 'name' is NOT included here
            }
        });

        return NextResponse.json({ success: true, userId: user.id }, { status: 201 });

    } catch (error) {
        console.error("SIGNUP ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}