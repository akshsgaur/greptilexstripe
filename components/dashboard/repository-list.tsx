"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitBranch, MessageSquare, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Repository {
  id: string
  name: string
  full_name: string
  description: string | null
  github_url: string
  branch: string
  is_indexed: boolean
  created_at: string
  updated_at: string
}

interface RepositoryListProps {
  repositories: Repository[]
}

export function RepositoryList({ repositories }: RepositoryListProps) {
  if (repositories.length === 0) {
    return (
      <Card className="p-12 text-center">
        <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No repositories yet</h3>
        <p className="text-muted-foreground mb-6">
          Connect your first GitHub repository to start querying your code with AI
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {repositories.map((repo) => (
        <Card key={repo.id} className="p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate mb-1">{repo.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{repo.full_name}</p>
            </div>
            <Badge variant={repo.is_indexed ? "default" : "secondary"} className="ml-2">
              {repo.is_indexed ? "Indexed" : "Pending"}
            </Badge>
          </div>

          {repo.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{repo.description}</p>}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <GitBranch className="h-3 w-3" />
            <span>{repo.branch}</span>
            <span>•</span>
            <span>Added {formatDistanceToNow(new Date(repo.created_at), { addSuffix: true })}</span>
          </div>

          <div className="flex gap-2">
            <Button asChild className="flex-1" size="sm">
              <Link href={`/dashboard/repo/${repo.id}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Query
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={repo.github_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
