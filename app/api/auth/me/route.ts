import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // if using JWT
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    return NextResponse.json({ authenticated: true, user: decoded });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
