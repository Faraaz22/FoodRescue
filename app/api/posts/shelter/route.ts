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
    if (!decoded || decoded.role !== "shelter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await connectDB()

    // Get available posts (open status, not expired)
    const availablePosts = await Post.find({
      status: "open",
      pickupEnd: { $gte: new Date() },
    })
      .populate("providerId", "name email")
      .sort({ createdAt: -1 })

    // Get posts claimed by this shelter
    const claimedPosts = await Post.find({
      claimedBy: decoded.userId,
      status: "claimed",
    })
      .populate("providerId", "name email")
      .sort({ createdAt: -1 })

    const formattedAvailablePosts = availablePosts.map((post) => ({
      ...post.toObject(),
      provider: post.providerId ? { name: post.providerId.name, email: post.providerId.email } : null,
    }))

    const formattedClaimedPosts = claimedPosts.map((post) => ({
      ...post.toObject(),
      provider: post.providerId ? { name: post.providerId.name, email: post.providerId.email } : null,
    }))

    return NextResponse.json({
      availablePosts: formattedAvailablePosts,
      claimedPosts: formattedClaimedPosts,
    })
  } catch (error) {
    console.error("Fetch shelter posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
