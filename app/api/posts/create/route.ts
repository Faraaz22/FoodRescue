import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Post from "@/models/Post"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
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

    const { description, qtyEstimate, pickupStart, pickupEnd, location } = await request.json()

    if (!description || !qtyEstimate || !pickupStart || !pickupEnd || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const post = new Post({
      providerId: decoded.userId,
      description,
      qtyEstimate,
      pickupStart: new Date(pickupStart),
      pickupEnd: new Date(pickupEnd),
      location,
    })

    await post.save()

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
