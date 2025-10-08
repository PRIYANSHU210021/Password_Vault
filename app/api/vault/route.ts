// app/api/vault/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import VaultItem from "./../../../models/VaultItem";
import jwt from "jsonwebtoken";

// MongoDB connection helper
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGO_URI!);
};

// Helper to get userId from JWT
const getUserIdFromJWT = (req: Request) => {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.userId;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
};

// GET /api/vault
export async function GET(req: Request) {
  try {
    await connectDB();

    const userId = getUserIdFromJWT(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await VaultItem.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /vault error:", error);
    return NextResponse.json({ error: "Failed to fetch vault items" }, { status: 500 });
  }
}

// POST /api/vault
export async function POST(req: Request) {
  try {
    await connectDB();

    const userId = getUserIdFromJWT(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    console.log("This is body ",body) 
    const { ciphertext, iv } = body;

    if (!ciphertext || !iv) {
      return NextResponse.json({ error: "Missing ciphertext or iv" }, { status: 400 });
    }

    const newItem = await VaultItem.create({ userId, ciphertext, iv });

    return NextResponse.json({ item: newItem });
  } catch (error) {
    console.error("POST /vault error:", error);
    return NextResponse.json({ error: "Failed to add vault item" }, { status: 500 });
  }
}
