"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MetricsCard from "@/components/metrics-card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Package, Users, TrendingUp } from "lucide-react"

interface AnalyticsData {
  totalUsers: number
  totalPosts: number
  totalKgSaved: number
  totalMeals: number
  activeRestaurants: number
  activeShelters: number
  claimRate: number
  monthlyData: Array<{
    month: string
    posts: number
    claimed: number
    kgSaved: number
  }>
  topRestaurants: Array<{
    name: string
    kgDonated: number
    posts: number
  }>
  topShelters: Array<{
    name: string
    kgClaimed: number
    claims: number
  }>
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </CardContent>
      </Card>
    )
  }

  const pieData = [
    { name: "Claimed", value: data.monthlyData.reduce((sum, item) => sum + item.claimed, 0), color: "#059669" },
    {
      name: "Available",
      value: data.monthlyData.reduce((sum, item) => sum + item.posts - item.claimed, 0),
      color: "#10b981",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Food Saved"
          value={`${data.totalKgSaved} kg`}
          description="Across all restaurants"
          icon={<Package />}
          variant="success"
        />
        <MetricsCard
          title="Meals Provided"
          value={data.totalMeals.toLocaleString()}
          description="Estimated meals (0.5kg = 1 meal)"
          icon={<Users />}
          variant="success"
        />
        <MetricsCard
          title="Active Users"
          value={data.totalUsers}
          description={`${data.activeRestaurants} restaurants, ${data.activeShelters} shelters`}
          icon={<Users />}
        />
        <MetricsCard
          title="Claim Rate"
          value={`${data.claimRate}%`}
          description="Posts successfully claimed"
          icon={<TrendingUp />}
          variant={data.claimRate > 80 ? "success" : data.claimRate > 60 ? "warning" : "destructive"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Food Rescue Trends</CardTitle>
            <CardDescription>Posts created vs. successfully claimed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="posts" fill="#10b981" name="Posts Created" />
                <Bar dataKey="claimed" fill="#059669" name="Posts Claimed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Claim Rate Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Claim Distribution</CardTitle>
            <CardDescription>Breakdown of claimed vs. available food posts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name }) => `${name}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Restaurants */}
        <Card>
          <CardHeader>
            <CardTitle>Top Contributing Restaurants</CardTitle>
            <CardDescription>Restaurants with the highest food donations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topRestaurants.map((restaurant, index) => (
                <div key={restaurant.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{restaurant.name}</p>
                      <p className="text-sm text-muted-foreground">{restaurant.posts} posts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{restaurant.kgDonated} kg</p>
                    <p className="text-sm text-muted-foreground">{Math.round(restaurant.kgDonated / 0.5)} meals</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Shelters */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Shelters</CardTitle>
            <CardDescription>Shelters with the highest food claims</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topShelters.map((shelter, index) => (
                <div key={shelter.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{shelter.name}</p>
                      <p className="text-sm text-muted-foreground">{shelter.claims} claims</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{shelter.kgClaimed} kg</p>
                    <p className="text-sm text-muted-foreground">{Math.round(shelter.kgClaimed / 0.5)} meals</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Environmental Impact</CardTitle>
          <CardDescription>The positive impact of food rescue efforts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.totalKgSaved} kg</div>
              <p className="text-sm text-green-700">Food waste prevented</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{Math.round(data.totalKgSaved * 2.5)} kg CO₂</div>
              <p className="text-sm text-blue-700">Emissions avoided</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{data.totalMeals}</div>
              <p className="text-sm text-purple-700">People fed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
