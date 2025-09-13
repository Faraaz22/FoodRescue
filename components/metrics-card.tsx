"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricsCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label: string
    direction: "up" | "down" | "neutral"
  }
  icon?: React.ReactNode
  variant?: "default" | "success" | "warning" | "destructive"
}

export default function MetricsCard({ title, value, description, trend, icon, variant = "default" }: MetricsCardProps) {
  const getTrendIcon = () => {
    switch (trend?.direction) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTrendColor = () => {
    switch (trend?.direction) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getValueColor = () => {
    switch (variant) {
      case "success":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "destructive":
        return "text-red-600"
      default:
        return "text-primary"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getValueColor()}`}>{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <div className="flex items-center space-x-1 mt-2">
            {getTrendIcon()}
            <span className={`text-xs font-medium ${getTrendColor()}`}>
              {trend.value > 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
