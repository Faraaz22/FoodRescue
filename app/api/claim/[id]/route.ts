import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Post from "@/models/Post"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"
import { pusherServer } from "@/lib/pusher"
import { sendClaimNotification } from "@/lib/mailer"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const postId = params.id

    // Find the post and check if it's still available
    const post = await Post.findById(postId).populate("providerId")
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (post.status !== "open") {
      return NextResponse.json({ error: "Post is no longer available" }, { status: 400 })
    }

    if (new Date() > post.pickupEnd) {
      return NextResponse.json({ error: "Pickup window has expired" }, { status: 400 })
    }

    // Get shelter information
    const shelter = await User.findById(decoded.userId)
    if (!shelter) {
      return NextResponse.json({ error: "Shelter not found" }, { status: 404 })
    }

    // Update post status
    post.status = "claimed"
    post.claimedBy = decoded.userId
    await post.save()

    // Send real-time notification via Pusher
    try {
      await pusherServer.trigger(`restaurant-${post.providerId._id}`, "food-claimed", {
        postId: post._id,
        description: post.description,
        shelterName: shelter.name,
        qtyEstimate: post.qtyEstimate,
      })
    } catch (pusherError) {
      console.error("Pusher notification failed:", pusherError)
    }

    // Send email notification
    try {
      await sendClaimNotification(
        post.providerId.email,
        post.providerId.name,
        shelter.name,
        post.description,
        post.pickupStart,
        post.pickupEnd,
      )
    } catch (emailError) {
      console.error("Email notification failed:", emailError)
    }

    return NextResponse.json({ message: "Food claimed successfully", post })
  } catch (error) {
    console.error("Claim post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
