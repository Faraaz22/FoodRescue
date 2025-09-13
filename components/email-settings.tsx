"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EmailSettings() {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [sendingTest, setSendingTest] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [testName, setTestName] = useState("")
  const [testRole, setTestRole] = useState<"restaurant" | "shelter" | "">("")

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/email/test")
      const data = await response.json()
      setTestResult(data)
    }  catch (error: any) {
  setTestResult({
    success: false,
    message: error?.message || "Network error occurred",
  })
    } finally {
      setTesting(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail || !testName || !testRole) return

    setSendingTest(true)

    try {
      const response = await fetch("/api/email/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          name: testName,
          role: testRole,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTestResult({ success: true, message: "Test email sent successfully!" })
        setTestEmail("")
        setTestName("")
        setTestRole("")
      } else {
        setTestResult({ success: false, message: data.error || "Failed to send test email" })
      }
    } catch (error) {
      setTestResult({ success: false, message: "Network error occurred" })
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>Test your email settings and send sample emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Connection Status</h4>
              <p className="text-sm text-muted-foreground">Test if your email configuration is working</p>
            </div>
            <Button onClick={testConnection} disabled={testing}>
              {testing ? "Testing..." : "Test Connection"}
            </Button>
          </div>

          {testResult && (
            <div className="mt-4">
              <Badge variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? "✓ Connected" : "✗ Failed"}
              </Badge>
              <p className="text-sm mt-2 text-muted-foreground">{testResult.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
          <CardDescription>Send a sample welcome email to test your configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testName">Name</Label>
              <Input
                id="testName"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Test User"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="testRole">Role</Label>
            <Select value={testRole} onValueChange={(value: "restaurant" | "shelter") => setTestRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role for test email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="shelter">Shelter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={sendTestEmail}
            disabled={sendingTest || !testEmail || !testName || !testRole}
            className="w-full"
          >
            {sendingTest ? "Sending..." : "Send Test Email"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
