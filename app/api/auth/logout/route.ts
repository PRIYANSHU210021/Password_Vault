// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ msg: "Logged out" });
  res.cookies.set("token", "", { maxAge: 0, path: "/" });
  return res;
}
