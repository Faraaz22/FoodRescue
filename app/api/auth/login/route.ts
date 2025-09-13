import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { verifyPassword, generateToken } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    const user = await User.findOne({ email })
    if (!user || !user.passwordHash) {
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
}
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = generateToken(user._id.toString(), user.role)

    const response = NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
