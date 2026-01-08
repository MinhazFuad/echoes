import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "echoes";

// Helper to get user from token
const getUserFromToken = (req: Request) => {
  const auth = req.headers.get("Authorization");
  if (!auth) return null;
  const token = auth.split(" ")[1];
  try {
    return jwt.verify(token, SECRET) as { userId: number };
  } catch {
    return null;
  }
};

// 1. UPLOAD IMAGE
export async function POST(req: Request) {
  try {
    const userPayload = getUserFromToken(req);
    if (!userPayload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { image, isPublic } = body; 

    if (!image) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }

    // Default emotion to "laugh" (Gold) if not provided, 
    // or assign a random one to keep the feed diverse.
    const defaultEmotions = ["laugh", "sad", "love"];
    const randomEmotion = defaultEmotions[Math.floor(Math.random() * defaultEmotions.length)];

    const post = await prisma.post.create({
      data: {
        url: image,
        emotion: randomEmotion, // Auto-assigned
        isPublic: isPublic !== undefined ? isPublic : true,
        userId: userPayload.userId,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// 2. FETCH USER POSTS
export async function GET(req: Request) {
  try {
    const userPayload = getUserFromToken(req);
    if (!userPayload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const posts = await prisma.post.findMany({
      where: { userId: userPayload.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}