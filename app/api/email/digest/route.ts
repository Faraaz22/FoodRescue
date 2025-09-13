import { type NextRequest, NextResponse } from "next/server"
import { sendDigestManually } from "@/lib/cron-service"

export async function POST(request: NextRequest) {
  try {
    const result = await sendDigestManually()

    return NextResponse.json({
      message: "Daily digest sent",
      emailsSent: result.emailsSent,
      emailsFailed: result.emailsFailed,
    })
  } catch (error) {
    console.error("Manual digest error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
