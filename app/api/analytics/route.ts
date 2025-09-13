import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
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

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get basic counts
    const totalUsers = await User.countDocuments()
    const activeRestaurants = await User.countDocuments({ role: "restaurant" })
    const activeShelters = await User.countDocuments({ role: "shelter" })

    const totalPosts = await Post.countDocuments({
      createdAt: { $gte: startDate },
    })

    const claimedPosts = await Post.countDocuments({
      status: "claimed",
      createdAt: { $gte: startDate },
    })

    // Calculate total food saved (only claimed posts)
    const claimedPostsData = await Post.find({
      status: "claimed",
      createdAt: { $gte: startDate },
    })

    const totalKgSaved = claimedPostsData.reduce((sum, post) => sum + post.qtyEstimate, 0)
    const totalMeals = Math.round(totalKgSaved / 0.5)
    const claimRate = totalPosts > 0 ? Math.round((claimedPosts / totalPosts) * 100) : 0

    // Generate monthly data for charts
    const monthlyData = []
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthPosts = await Post.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd },
      })

      const monthClaimed = await Post.countDocuments({
        status: "claimed",
        createdAt: { $gte: monthStart, $lte: monthEnd },
      })

      const monthClaimedData = await Post.find({
        status: "claimed",
        createdAt: { $gte: monthStart, $lte: monthEnd },
      })

      const monthKgSaved = monthClaimedData.reduce((sum, post) => sum + post.qtyEstimate, 0)

      monthlyData.push({
        month: months[monthStart.getMonth()],
        posts: monthPosts,
        claimed: monthClaimed,
        kgSaved: monthKgSaved,
      })
    }

    // Get top restaurants
    const topRestaurantsData = await Post.aggregate([
      {
        $match: {
          status: "claimed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$providerId",
          kgDonated: { $sum: "$qtyEstimate" },
          posts: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          name: "$user.name",
          kgDonated: 1,
          posts: 1,
        },
      },
      {
        $sort: { kgDonated: -1 },
      },
      {
        $limit: 5,
      },
    ])

    // Get top shelters
    const topSheltersData = await Post.aggregate([
      {
        $match: {
          status: "claimed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$claimedBy",
          kgClaimed: { $sum: "$qtyEstimate" },
          claims: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          name: "$user.name",
          kgClaimed: 1,
          claims: 1,
        },
      },
      {
        $sort: { kgClaimed: -1 },
      },
      {
        $limit: 5,
      },
    ])

    const analyticsData = {
      totalUsers,
      totalPosts,
      totalKgSaved: Math.round(totalKgSaved * 10) / 10, // Round to 1 decimal
      totalMeals,
      activeRestaurants,
      activeShelters,
      claimRate,
      monthlyData,
      topRestaurants: topRestaurantsData.map((item) => ({
        name: item.name,
        kgDonated: Math.round(item.kgDonated * 10) / 10,
        posts: item.posts,
      })),
      topShelters: topSheltersData.map((item) => ({
        name: item.name,
        kgClaimed: Math.round(item.kgClaimed * 10) / 10,
        claims: item.claims,
      })),
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
