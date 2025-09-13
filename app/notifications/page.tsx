"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { pusherClient } from "@/lib/pusher"
import type { User } from "@/types/user"

interface Notification {
  id: string
  type: "food-claimed"
  message: string
  timestamp: Date
  data?: any
}

export default function NotificationsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user && user.role === "restaurant") {
      // Subscribe to restaurant-specific channel
      const channel = pusherClient.subscribe(`restaurant-${user._id}`)

      channel.bind("food-claimed", (data: any) => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: "food-claimed",
          message: `Your food post "${data.description}" (${data.qtyEstimate} kg) was claimed by ${data.shelterName}`,
          timestamp: new Date(),
          data,
        }

        setNotifications((prev) => [newNotification, ...prev])

        // Show browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification("Food Claimed!", {
            body: newNotification.message,
            icon: "/favicon.ico",
          })
        }
      })

      return () => {
        pusherClient.unsubscribe(`restaurant-${user._id}`)
      }
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)

        // Request notification permission
        if (Notification.permission === "default") {
          Notification.requestPermission()
        }
      } else {
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="mt-2 text-muted-foreground">
            {user.role === "restaurant"
              ? "Get notified when your food donations are claimed"
              : "Notification center for your account"}
          </p>
        </div>

        {user.role !== "restaurant" && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Real-time notifications are currently available for restaurants only.
              </p>
            </CardContent>
          </Card>
        )}

        {user.role === "restaurant" && (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No notifications yet. You'll be notified here when shelters claim your food donations.
                  </p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Food Claimed</CardTitle>
                      <Badge variant="default">New</Badge>
                    </div>
                    <CardDescription>{notification.timestamp.toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{notification.message}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
