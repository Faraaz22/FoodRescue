import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Post from "@/models/Post"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get all open posts for public viewing (no auth required)
    const posts = await Post.find({
      status: "open",
      pickupEnd: { $gte: new Date() },
    })
      .populate("providerId", "name")
      .sort({ createdAt: -1 })

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      provider: post.providerId ? { name: post.providerId.name } : null,
    }))

    return NextResponse.json({ posts: formattedPosts })
  } catch (error) {
    console.error("Fetch posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
