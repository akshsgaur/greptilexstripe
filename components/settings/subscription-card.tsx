"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: "free" | "pro" | "enterprise"
  status: "active" | "canceled" | "past_due" | "trialing"
  current_period_end: string | null
}

interface SubscriptionCardProps {
  subscription: Subscription | null
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: "price_pro", // This would be your actual Stripe price ID
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Error creating portal session:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentPlan = subscription?.plan || "free"
  const isActive = subscription?.status === "active" || subscription?.status === "trialing"

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Subscription</h2>
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? "default" : "secondary"} className="capitalize">
              {currentPlan}
            </Badge>
            {subscription?.status && (
              <Badge variant="outline" className="capitalize">
                {subscription.status}
              </Badge>
            )}
          </div>
        </div>
        <CreditCard className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="space-y-4">
        {currentPlan === "free" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Pro to unlock unlimited repositories and queries
            </p>
            <Button onClick={handleUpgrade} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Upgrade to Pro
            </Button>
          </div>
        )}

        {currentPlan === "pro" && isActive && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">You have full access to all Pro features</p>
            {subscription?.current_period_end && (
              <p className="text-xs text-muted-foreground mb-4">
                Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
            <Button variant="outline" onClick={handleManageBilling} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Manage Billing
            </Button>
          </div>
        )}

        {currentPlan === "enterprise" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">You have access to all Enterprise features</p>
            <Button variant="outline" onClick={handleManageBilling} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Manage Billing
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
