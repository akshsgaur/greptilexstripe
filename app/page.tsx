import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code2, Zap, Shield, GitBranch, Search, MessageSquare } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-medium">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">OppsSource.ai</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="rounded-full" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button className="rounded-full px-6" asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-20 md:py-24">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 text-center sm:px-6 lg:px-8">
          <Badge variant="secondary" className="text-xs">
            <Zap className="mr-1 h-3 w-3" />
            AI-Powered Code Intelligence
          </Badge>
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Understand any codebase in <span className="text-primary">seconds</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
            OppsSource.ai uses advanced AI to help developers navigate, understand, and query their GitHub repositories
            using natural language. Stop searching through files—just ask.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/auth/sign-up">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-20 md:py-28">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-balance">
            Built for developers who move fast
          </h2>
          <p className="max-w-2xl text-center text-muted-foreground text-pretty">
            Powerful features that help you understand and navigate codebases faster than ever before
          </p>
          <div className="mt-10 grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="rounded-3xl border-border/40 bg-background/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50">
              <Search className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Natural Language Search</h3>
              <p className="text-muted-foreground">
                Ask questions in plain English and get instant answers about your codebase. No complex queries needed.
              </p>
            </Card>
            <Card className="rounded-3xl border-border/40 bg-background/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50">
              <MessageSquare className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Chat Interface</h3>
              <p className="text-muted-foreground">
                Have a conversation with your code. Ask follow-up questions and get contextual answers instantly.
              </p>
            </Card>
            <Card className="rounded-3xl border-border/40 bg-background/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50">
              <GitBranch className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">GitHub Integration</h3>
              <p className="text-muted-foreground">
                Seamlessly connect your GitHub repositories and start querying them in seconds.
              </p>
            </Card>
            <Card className="rounded-3xl border-border/40 bg-background/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50">
              <Code2 className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Code Context</h3>
              <p className="text-muted-foreground">
                Get deep insights into functions, classes, and dependencies with full context awareness.
              </p>
            </Card>
            <Card className="rounded-3xl border-border/40 bg-background/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Powered by advanced AI models optimized for code understanding and instant responses.
              </p>
            </Card>
            <Card className="rounded-3xl border-border/40 bg-background/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50">
              <Shield className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your code stays private. We use secure connections and never store your repository data.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-20 md:py-28">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-balance">
            Simple, transparent pricing
          </h2>
          <p className="max-w-2xl text-center text-muted-foreground text-pretty">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
          <div className="mt-10 grid w-full gap-8 md:grid-cols-3">
            <Card className="flex flex-col rounded-3xl border-border/40 bg-background/80 p-8 shadow-sm">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">1 repository</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">100 queries/month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">Basic AI features</span>
              </li>
            </ul>
              <Button variant="outline" className="w-full rounded-full bg-transparent" asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </Card>
            <Card className="relative flex flex-col rounded-3xl border-2 border-primary bg-background/80 p-8 shadow-lg">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">10 repositories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">Unlimited queries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">Advanced AI features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">Priority support</span>
              </li>
            </ul>
              <Button className="w-full rounded-full" asChild>
                <Link href="/auth/sign-up">Start Free Trial</Link>
              </Button>
            </Card>
            <Card className="flex flex-col rounded-3xl border-border/40 bg-background/80 p-8 shadow-sm">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">Custom</span>
              </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">Unlimited repositories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">Unlimited queries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">Custom AI models</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">Dedicated support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">SLA guarantee</span>
              </li>
            </ul>
              <Button variant="outline" className="w-full rounded-full bg-transparent">
              Contact Sales
            </Button>
          </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-28">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <Card className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-12 text-center shadow-lg">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-balance">
            Ready to understand your code better?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Join thousands of developers who are already using OppsSource.ai to navigate their codebases faster.
          </p>
            <Button size="lg" className="rounded-full px-8" asChild>
            <Link href="/auth/sign-up">Start Your Free Trial</Link>
          </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="font-semibold">OppsSource.ai</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 OppsSource.ai. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
