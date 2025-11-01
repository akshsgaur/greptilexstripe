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
  default_branch: string
  is_indexed: boolean
}

interface RepositoryInfoProps {
  repository: Repository
}

export function RepositoryInfo({ repository }: RepositoryInfoProps) {
  return (
    <div className="border-b border-border/40 bg-card">
      <div className="container py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold truncate">{repository.name}</h1>
              <Badge variant={repository.is_indexed ? "default" : "secondary"}>
                {repository.is_indexed ? "Indexed" : "Indexing..."}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{repository.full_name}</p>
            {repository.description && <p className="text-sm text-muted-foreground mb-3">{repository.description}</p>}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span>{repository.default_branch}</span>
            </div>
          </div>
          <Button variant="outline" asChild>
            <a href={repository.github_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on GitHub
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
