import mongoose, { Schema, type Document } from "mongoose"

export interface IPost extends Document {
  providerId: mongoose.Types.ObjectId
  description: string
  qtyEstimate: number
  pickupStart: Date
  pickupEnd: Date
  location: string
  status: "open" | "claimed"
  claimedBy?: mongoose.Types.ObjectId
  createdAt: Date
}

const PostSchema = new Schema<IPost>({
  providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  qtyEstimate: { type: Number, required: true },
  pickupStart: { type: Date, required: true },
  pickupEnd: { type: Date, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ["open", "claimed"], default: "open" },
  claimedBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema)
