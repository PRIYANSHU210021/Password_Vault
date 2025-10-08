// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  const { email, password } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  console.log("This is email from loging page",email);
  console.log("This is user from db",user)
  if (!user) return NextResponse.json({ msg: "User not found" }, { status: 400 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return NextResponse.json({ msg: "Invalid credentials" }, { status: 400 });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1d" });

  const res = NextResponse.json({ msg: "Login successful", kdfSalt: user.kdfSalt });
  res.cookies.set("token", token, { httpOnly: true, maxAge: 86400, path: "/" });
  return res;
}
