"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitBranch, ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Repository {
  id: string
  name: string
  full_name: string
  description: string | null
  github_url: string
  branch: string
  is_indexed: boolean
}

interface RepositoryInfoProps {
  repository: Repository
}

export function RepositoryInfo({ repository }: RepositoryInfoProps) {
  return (
    <section className="w-full border-b border-border/40 bg-card/70 pb-6 pt-8 backdrop-blur">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 rounded-3xl border border-border/30 bg-background/80 p-6 shadow-sm sm:p-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="rounded-full px-4">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <Badge variant={repository.is_indexed ? "default" : "secondary"} className="rounded-full px-2.5 py-0.5 text-xs">
                {repository.is_indexed ? "Indexed" : "Indexing..."}
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{repository.name}</h1>
              <p className="text-sm font-mono text-muted-foreground">{repository.full_name}</p>
            </div>

            {repository.description && (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{repository.description}</p>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-muted/40 px-3 py-1 font-medium">
                <GitBranch className="h-4 w-4" />
                {repository.branch}
              </span>
            </div>
          </div>

          <Button variant="outline" asChild className="h-fit rounded-full border-border/60 px-5 py-2 shadow-sm">
            <a href={repository.github_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View on GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
