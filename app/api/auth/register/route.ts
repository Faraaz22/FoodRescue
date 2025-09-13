import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { hashPassword, generateToken } from "@/lib/auth"
import { sendWelcomeEmail } from "@/lib/mailer"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["restaurant", "shelter"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    const user = new User({
      name,
      email,
      passwordHash,
      role,
    })

    await user.save()

    const token = generateToken(user._id.toString(), user.role)

    try {
      await sendWelcomeEmail(user.email, user.name, user.role)
    } catch (emailError) {
      console.error("Welcome email failed:", emailError)
      // Don't fail registration if email fails
    }

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
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
