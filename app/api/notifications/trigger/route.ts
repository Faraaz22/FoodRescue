import { type NextRequest, NextResponse } from "next/server"
import { pusherServer } from "@/lib/pusher"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { channel, event, data } = await request.json()

    if (!channel || !event || !data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Trigger the Pusher event
    await pusherServer.trigger(channel, event, data)

    return NextResponse.json({ message: "Notification sent successfully" })
  } catch (error) {
    console.error("Trigger notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
