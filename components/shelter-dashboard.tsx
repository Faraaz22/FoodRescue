"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import NotificationToast from "@/components/notification-toast"
import type { User } from "@/types/user"
import type { Post } from "@/types/post"

interface ShelterDashboardProps {
  user: User
}

interface ToastNotification {
  id: string
  message: string
  type: "success" | "info" | "warning" | "error"
}

export default function ShelterDashboard({ user }: ShelterDashboardProps) {
  const [availablePosts, setAvailablePosts] = useState<Post[]>([])
  const [claimedPosts, setClaimedPosts] = useState<Post[]>([])
  const [metrics, setMetrics] = useState({ totalKg: 0, totalMeals: 0 })
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastNotification[]>([])

  useEffect(() => {
    fetchPosts()
    fetchMetrics()
  }, [])

  const addToast = (message: string, type: "success" | "info" | "warning" | "error" = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts/shelter")
      if (response.ok) {
        const data = await response.json()
        setAvailablePosts(data.availablePosts)
        setClaimedPosts(data.claimedPosts)
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      addToast("Failed to load posts", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/metrics")
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error)
    }
  }

  const handleClaim = async (postId: string) => {
    setClaiming(postId)
    try {
      const response = await fetch(`/api/claim/${postId}`, {
        method: "POST",
      })

      if (response.ok) {
        fetchPosts()
        fetchMetrics()
        addToast("Food claimed successfully! The restaurant has been notified.", "success")
      } else {
        const data = await response.json()
        addToast(data.error || "Failed to claim food", "error")
      }
    } catch (error) {
      console.error("Failed to claim post:", error)
      addToast("Network error. Please try again.", "error")
    } finally {
      setClaiming(null)
    }
  }

  const isPickupTimeValid = (pickupStart: Date, pickupEnd: Date) => {
    const now = new Date()
    return now <= new Date(pickupEnd)
  }

  return (
    <>
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <NotificationToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Shelter Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {user.name}! Browse available food donations and track your impact.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Food Claimed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metrics.totalKg} kg</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Meals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metrics.totalMeals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{availablePosts.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Available Food Posts */}
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-semibold text-foreground">Available Food</h2>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                      <div className="h-8 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availablePosts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No food available at the moment. Check back later!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availablePosts.map((post) => {
                const pickupValid = isPickupTimeValid(new Date(post.pickupStart), new Date(post.pickupEnd))
                return (
                  <Card key={post._id} className={!pickupValid ? "opacity-60" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{post.qtyEstimate} kg</CardTitle>
                        <Badge variant="default">Available</Badge>
                      </div>
                      {post.provider && (
                        <CardDescription className="text-sm">From {post.provider.name}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{post.description}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>📍 {post.location}</p>
                        <p>
                          🕐 {new Date(post.pickupStart).toLocaleString()} - {new Date(post.pickupEnd).toLocaleString()}
                        </p>
                        {!pickupValid && <p className="text-destructive font-medium">Pickup window expired</p>}
                      </div>
                      <Button
                        onClick={() => handleClaim(post._id)}
                        disabled={claiming === post._id || !pickupValid}
                        className="w-full"
                      >
                        {claiming === post._id ? "Claiming..." : pickupValid ? "Claim Food" : "Expired"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Claimed Food History */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Your Claimed Food</h2>
          {claimedPosts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No claimed food yet. Start claiming available food above!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {claimedPosts.map((post) => (
                <Card key={post._id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{post.qtyEstimate} kg</CardTitle>
                      <Badge variant="secondary">Claimed</Badge>
                    </div>
                    {post.provider && <CardDescription className="text-sm">From {post.provider.name}</CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>📍 {post.location}</p>
                      <p>
                        🕐 {new Date(post.pickupStart).toLocaleString()} - {new Date(post.pickupEnd).toLocaleString()}
                      </p>
                      <p className="text-primary font-medium">
                        Claimed on {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
