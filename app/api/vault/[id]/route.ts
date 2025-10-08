import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "./../../../../lib/db";
import VaultItem from "./../../../../models/VaultItem";
// import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { ciphertext, iv } = await req.json();
    if (!ciphertext || !iv) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const item = await VaultItem.create({
      userId: session.user.id,
      ciphertext,
      iv,
    });

    return NextResponse.json({ message: "Saved", item }, { status: 201 });
  } catch (error) {
    console.error("Vault save error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const items = await VaultItem.find({ userId: session.user.id });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Vault fetch error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
