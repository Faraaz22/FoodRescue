import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
              FoodRescue 
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty">
              Connect restaurants with shelters to reduce food waste and feed people in need. Simple, efficient, and
              impactful food rescue made easy.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/login">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" size="lg" className="px-8 bg-transparent">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How It Works</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">Three simple steps to make a difference</p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                    1
                  </div>
                  Post Surplus Food
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">
                    Restaurants post details about surplus food including quantity, pickup times, and location.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                    2
                  </div>
                  Shelters Claim Food
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">
                    Shelters browse available food posts and claim items they can pick up during the specified window.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                    3
                  </div>
                  Get Notified
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">
                    Restaurants receive instant notifications when their food is claimed, with pickup details.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
