// models/VaultItem.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IVaultItem extends Document {
  userId: mongoose.Types.ObjectId;
  ciphertext: string;
  iv: string;
}

const VaultSchema = new Schema<IVaultItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ciphertext: { type: String, required: true },
    iv: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.VaultItem ||
  mongoose.model<IVaultItem>("VaultItem", VaultSchema);
