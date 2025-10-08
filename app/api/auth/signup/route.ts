// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB  from "./../../../../lib/db";
import User from "./../../../../models/User";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ msg: "Email and password required" }, { status: 400 });
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ msg: "User already exists" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const randomSalt = crypto.getRandomValues(new Uint8Array(16));
  const kdfSalt = Buffer.from(randomSalt).toString("base64");

  await User.create({ email, passwordHash, kdfSalt });

  return NextResponse.json({ msg: "Signup successful", kdfSalt });
}
