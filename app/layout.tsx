import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { initializeCronJobs } from "@/lib/cron-service"
import "./globals.css"

export const metadata: Metadata = {
  title: "FoodRescue Lite",
  description: "Connect restaurants with shelters to reduce food waste and feed people in need",
  generator: "v0.app",
}

if (typeof window === "undefined") {
  initializeCronJobs()
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
