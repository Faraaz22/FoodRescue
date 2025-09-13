"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface NotificationToastProps {
  message: string
  type?: "success" | "info" | "warning" | "error"
  duration?: number
  onClose: () => void
}

export default function NotificationToast({
  message,
  type = "info",
  duration = 5000,
  onClose,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Allow fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "border-l-4 border-l-green-500 bg-green-50 text-green-800"
      case "warning":
        return "border-l-4 border-l-yellow-500 bg-yellow-50 text-yellow-800"
      case "error":
        return "border-l-4 border-l-red-500 bg-red-50 text-red-800"
      default:
        return "border-l-4 border-l-primary bg-primary/5 text-foreground"
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <Card className={`w-80 ${getTypeStyles()}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium pr-2">{message}</p>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0 hover:bg-transparent">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
