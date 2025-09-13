import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  role: "restaurant" | "shelter"
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["restaurant", "shelter"], required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
