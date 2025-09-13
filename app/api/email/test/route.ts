import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { testEmailConnection } from "@/lib/mailer"
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

    const result = await testEmailConnection()

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Email test error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Email test failed",
        error: error?.message ?? "Unknown error",
      },
      { status: 500 },
    )
  }
}
