import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Post from "@/models/Post"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "restaurant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await connectDB()

    const posts = await Post.find({ providerId: decoded.userId }).populate("claimedBy", "name").sort({ createdAt: -1 })

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      claimer: post.claimedBy ? { name: post.claimedBy.name } : null,
    }))

    return NextResponse.json({ posts: formattedPosts })
  } catch (error) {
    console.error("Fetch restaurant posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
