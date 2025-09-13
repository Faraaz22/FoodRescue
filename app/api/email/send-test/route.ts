import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { sendWelcomeEmail } from "@/lib/mailer"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Read the auth-token cookie from the request
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Parse JSON body
    const body = await request.json()
    const { email, name, role } = body as {
      email: string
      name: string
      role: "restaurant" | "shelter"
    }

    if (!email || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await sendWelcomeEmail(email, name, role)

    return NextResponse.json({ success: true, message: "Test email sent successfully" })
  } catch (error: any) {
    console.error("Send test email error:", error)
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error?.message ?? "Unknown error",
      },
      { status: 500 },
    )
  }
}
