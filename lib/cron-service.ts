import cron from "node-cron"
import connectDB from "@/lib/db"
import User from "@/models/User"
import Post from "@/models/Post"
import { sendDailyDigest } from "@/lib/mailer"

let isInitialized = false

export function initializeCronJobs() {
  if (isInitialized) return

  cron.schedule(
    "0 8 * * *",
    async () => {
      console.log("[v0] Running daily digest cron job at", new Date().toISOString())

      try {
        await connectDB()

        const users = await User.find({}).select("-passwordHash")
        let emailsSent = 0
        let emailsFailed = 0

        for (const user of users) {
          try {
            const stats = { totalKg: 0, totalMeals: 0 }

            if (user.role === "restaurant") {
              const claimedPosts = await Post.find({
                providerId: user._id,
                status: "claimed",
              })
              const activePosts = await Post.countDocuments({
                providerId: user._id,
                status: "open",
              })

              stats.totalKg = claimedPosts.reduce((sum, post) => sum + post.qtyEstimate, 0)
              stats.totalMeals = Math.round(stats.totalKg / 0.5)
              stats.activePosts = activePosts
            } else {
              const claimedPosts = await Post.find({
                claimedBy: user._id,
                status: "claimed",
              })
              const claimedToday = await Post.countDocuments({
                claimedBy: user._id,
                status: "claimed",
                createdAt: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  $lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
              })

              stats.totalKg = claimedPosts.reduce((sum, post) => sum + post.qtyEstimate, 0)
              stats.totalMeals = Math.round(stats.totalKg / 0.5)
              stats.claimedToday = claimedToday
            }

            await sendDailyDigest(user.email, user.name, user.role, stats)
            emailsSent++
          } catch (emailError) {
            console.error(`Failed to send digest to ${user.email}:`, emailError)
            emailsFailed++
          }
        }

        console.log(`[v0] Daily digest completed: ${emailsSent} sent, ${emailsFailed} failed`)
      } catch (error) {
        console.error("[v0] Daily digest cron job error:", error)
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    },
  )

  cron.schedule(
    "0 * * * *",
    async () => {
      console.log("[v0] Running expired posts cleanup at", new Date().toISOString())

      try {
        await connectDB()

        const expiredPosts = await Post.updateMany(
          {
            status: "open",
            pickupEnd: { $lt: new Date() },
          },
          {
            $set: { status: "expired" },
          },
        )

        if (expiredPosts.modifiedCount > 0) {
          console.log(`[v0] Marked ${expiredPosts.modifiedCount} posts as expired`)
        }
      } catch (error) {
        console.error("[v0] Expired posts cleanup error:", error)
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    },
  )

  isInitialized = true
  console.log("[v0] Cron jobs initialized successfully")
}

export async function sendDigestManually() {
  try {
    await connectDB()

    const users = await User.find({}).select("-passwordHash")
    let emailsSent = 0
    let emailsFailed = 0

    for (const user of users) {
      try {
        const stats = { totalKg: 0, totalMeals: 0 }

        if (user.role === "restaurant") {
          const claimedPosts = await Post.find({
            providerId: user._id,
            status: "claimed",
          })
          const activePosts = await Post.countDocuments({
            providerId: user._id,
            status: "open",
          })

          stats.totalKg = claimedPosts.reduce((sum, post) => sum + post.qtyEstimate, 0)
          stats.totalMeals = Math.round(stats.totalKg / 0.5)
          stats.activePosts = activePosts
        } else {
          const claimedPosts = await Post.find({
            claimedBy: user._id,
            status: "claimed",
          })
          const claimedToday = await Post.countDocuments({
            claimedBy: user._id,
            status: "claimed",
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          })

          stats.totalKg = claimedPosts.reduce((sum, post) => sum + post.qtyEstimate, 0)
          stats.totalMeals = Math.round(stats.totalKg / 0.5)
          stats.claimedToday = claimedToday
        }

        await sendDailyDigest(user.email, user.name, user.role, stats)
        emailsSent++
      } catch (emailError) {
        console.error(`Failed to send digest to ${user.email}:`, emailError)
        emailsFailed++
      }
    }

    return { emailsSent, emailsFailed }
  } catch (error) {
    console.error("Manual digest error:", error)
    throw error
  }
}
