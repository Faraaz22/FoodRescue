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
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await connectDB()

    let totalKg = 0

    if (decoded.role === "restaurant") {
      // Restaurant metrics: total kg of claimed food
      const claimedPosts = await Post.find({
        providerId: decoded.userId,
        status: "claimed",
      })
      totalKg = claimedPosts.reduce((sum, post) => sum + post.qtyEstimate, 0)
    } else {
      // Shelter metrics: total kg of claimed food
      const claimedPosts = await Post.find({
        claimedBy: decoded.userId,
        status: "claimed",
      })
      totalKg = claimedPosts.reduce((sum, post) => sum + post.qtyEstimate, 0)
    }

    // Calculate estimated meals (0.5 kg = 1 meal)
    const totalMeals = Math.round(totalKg / 0.5)

    return NextResponse.json({ totalKg, totalMeals })
  } catch (error) {
    console.error("Fetch metrics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
