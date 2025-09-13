"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import NotificationToast from "@/components/notification-toast"
import { pusherClient } from "@/lib/pusher"
import type { User } from "@/types/user"
import type { Post } from "@/types/post"

interface RestaurantDashboardProps {
  user: User
}

interface ToastNotification {
  id: string
  message: string
  type: "success" | "info" | "warning" | "error"
}

export default function RestaurantDashboard({ user }: RestaurantDashboardProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [metrics, setMetrics] = useState({ totalKg: 0, totalMeals: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const [formData, setFormData] = useState({
    description: "",
    qtyEstimate: "",
    pickupStart: "",
    pickupEnd: "",
    location: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPosts()
    fetchMetrics()
    setupPusherSubscription()

    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    return () => {
      pusherClient.unsubscribe(`restaurant-${user._id}`)
    }
  }, [user._id])

  const setupPusherSubscription = () => {
    const channel = pusherClient.subscribe(`restaurant-${user._id}`)

    channel.bind("food-claimed", (data: any) => {
      const message = `Your food post "${data.description}" (${data.qtyEstimate} kg) was claimed by ${data.shelterName}!`

      // Add toast notification
      addToast(message, "success")

      // Show browser notification if permission granted
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Food Claimed!", {
          body: message,
          icon: "/favicon.ico",
        })
      }

      // Refresh posts and metrics
      fetchPosts()
      fetchMetrics()
    })
  }

  const addToast = (message: string, type: "success" | "info" | "warning" | "error" = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts/restaurant")
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          qtyEstimate: Number.parseFloat(formData.qtyEstimate),
          pickupStart: new Date(formData.pickupStart),
          pickupEnd: new Date(formData.pickupEnd),
        }),
      })

      if (response.ok) {
        setFormData({
          description: "",
          qtyEstimate: "",
          pickupStart: "",
          pickupEnd: "",
          location: "",
        })
        setShowForm(false)
        fetchPosts()
        fetchMetrics()
        addToast("Food post created successfully!", "success")
      } else {
        addToast("Failed to create food post", "error")
      }
    } catch (error) {
      console.error("Failed to create post:", error)
      addToast("Network error. Please try again.", "error")
    } finally {
      setSubmitting(false)
    }
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
          <h1 className="text-3xl font-bold text-foreground">Restaurant Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {user.name}! Manage your food donations and track your impact.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Food Saved</CardTitle>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{posts.filter((p) => p.status === "open").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <Button onClick={() => setShowForm(!showForm)} size="lg">
            {showForm ? "Cancel" : "Post Surplus Food"}
          </Button>
        </div>

        {/* Create Post Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Post Surplus Food</CardTitle>
              <CardDescription>Share details about your surplus food for shelters to claim</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="description">Food Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      placeholder="Describe the food items available..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qtyEstimate">Quantity (kg)</Label>
                    <Input
                      id="qtyEstimate"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.qtyEstimate}
                      onChange={(e) => setFormData({ ...formData, qtyEstimate: e.target.value })}
                      required
                      placeholder="Estimated weight in kg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupStart">Pickup Start</Label>
                    <Input
                      id="pickupStart"
                      type="datetime-local"
                      value={formData.pickupStart}
                      onChange={(e) => setFormData({ ...formData, pickupStart: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupEnd">Pickup End</Label>
                    <Input
                      id="pickupEnd"
                      type="datetime-local"
                      value={formData.pickupEnd}
                      onChange={(e) => setFormData({ ...formData, pickupEnd: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Pickup Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    placeholder="Full address for pickup"
                  />
                </div>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Posting..." : "Post Food"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Your Food Posts</h2>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No food posts yet. Create your first post to start helping!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card key={post._id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{post.qtyEstimate} kg</CardTitle>
                      <Badge variant={post.status === "open" ? "default" : "secondary"}>{post.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>📍 {post.location}</p>
                      <p>
                        🕐 {new Date(post.pickupStart).toLocaleString()} - {new Date(post.pickupEnd).toLocaleString()}
                      </p>
                      {post.status === "claimed" && post.claimer && (
                        <p className="text-primary font-medium">Claimed by {post.claimer.name}</p>
                      )}
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
