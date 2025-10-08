import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

// if (!MONGODB_URI) throw new Error("⚠️ Please define MONGODB_URI in .env.local");

// let isConnected = false;

export const connectDB = async () => {
//   if (isConnected) return;
  try {
    mongoose.connection.on('connected', ()=> console.log("Database  Connected"));
    await mongoose.connect(MONGODB_URI);
    // isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
};
