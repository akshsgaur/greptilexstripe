"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Loader2, MessageSquare, RefreshCcw, ExternalLink, BarChart3, Clock3, Tag } from "lucide-react"

interface Repository {
  id: string
  full_name: string
  branch: string
}

interface GitHubIssue {
  id: number
  number: number
  title: string
  html_url: string
  created_at: string
  comments: number
  labels: string[]
  body: string
}

interface GreptileSource {
  filepath: string
  linestart: number
  lineend: number
  repository: string
}

interface GreptileQueryResult {
  message: string
  sources: GreptileSource[]
}

interface RepositoryIssuesProps {
  repository: Repository
}

export function RepositoryIssues({ repository }: RepositoryIssuesProps) {
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<GreptileQueryResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const loadIssues = useCallback(async () => {
    if (!isMountedRef.current) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/github/issues?repositoryId=${repository.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch issues")
      }

      const data = await response.json()
      if (isMountedRef.current) {
        setIssues(Array.isArray(data.issues) ? data.issues : [])
      }
    } catch (fetchError) {
      console.error("Error loading GitHub issues:", fetchError)
      if (isMountedRef.current) {
        setError("Unable to load issues right now. Please try again.")
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [repository.id])

  useEffect(() => {
    loadIssues()
  }, [loadIssues])

  const uniqueSourceFiles = useMemo(() => {
    if (!analysis?.sources) return []
    const seen = new Set<string>()
    return analysis.sources.filter((source) => {
      if (seen.has(source.filepath)) return false
      seen.add(source.filepath)
      return true
    })
  }, [analysis])

  const issueStats = useMemo(() => {
    if (issues.length === 0) {
      return {
        totalIssues: 0,
        totalComments: 0,
        averageComments: 0,
        latestIssueCreatedAt: null as string | null,
      }
    }

    const totalComments = issues.reduce((sum, issue) => sum + issue.comments, 0)
    const latestIssueCreatedAt = issues.reduce((latest, issue) => {
      if (!latest) return issue.created_at
      return new Date(issue.created_at) > new Date(latest) ? issue.created_at : latest
    }, issues[0]?.created_at as string | undefined)

    return {
      totalIssues: issues.length,
      totalComments,
      averageComments: Number((totalComments / issues.length).toFixed(1)),
      latestIssueCreatedAt: latestIssueCreatedAt ?? null,
    }
  }, [issues])

  const topLabels = useMemo(() => {
    const labelFrequency = new Map<string, number>()

    issues.forEach((issue) => {
      issue.labels.forEach((label) => {
        labelFrequency.set(label, (labelFrequency.get(label) ?? 0) + 1)
      })
    })

    return Array.from(labelFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [issues])

  const formattedAnalysisSections = useMemo(() => {
    if (!analysis?.message) return []

    return analysis.message
      .trim()
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)
  }, [analysis])

  const openAnalysisModal = async (issue: GitHubIssue) => {
    setSelectedIssue(issue)
    setIsModalOpen(true)
    setIsAnalyzing(true)
    setAnalysis(null)
    setAnalysisError(null)

    const sessionId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`

    try {
      const searchResponse = await fetch("/api/greptile/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repositoryId: repository.id,
          issueTitle: issue.title,
          issueBody: issue.body,
          sessionId,
        }),
      })

      if (!searchResponse.ok) {
        throw new Error("Search request failed")
      }

      const searchData = await searchResponse.json()
      const effectiveSessionId = searchData.sessionId || sessionId

      const queryResponse = await fetch("/api/greptile/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repositoryId: repository.id,
          issueTitle: issue.title,
          issueBody: issue.body,
          sessionId: effectiveSessionId,
        }),
      })

      if (!queryResponse.ok) {
        throw new Error("Query request failed")
      }

      const queryData = (await queryResponse.json()) as GreptileQueryResult
      setAnalysis(queryData)
    } catch (analysisError) {
      console.error("Error analyzing issue:", analysisError)
      setAnalysisError("We couldn't analyze this issue right now. Please try again later.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) {
      setSelectedIssue(null)
      setAnalysis(null)
      setAnalysisError(null)
      setIsAnalyzing(false)
    }
  }

  return (
    <section className="w-full px-4 pb-10 pt-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-background/80 px-4 py-4 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Existing GitHub Issues</h2>
            <p className="text-sm text-muted-foreground">
              Stay on top of the latest open issues in <span className="font-medium text-foreground">{repository.full_name}</span>.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              loadIssues()
            }}
            disabled={isLoading}
            className="self-start rounded-full border border-border/60 font-medium transition-colors lg:self-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh issues
              </>
            )}
          </Button>
        </div>

        {isLoading ? (
          <Card className="border-border/40 bg-background/80 shadow-sm">
            <CardContent className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading issues from GitHub...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-destructive/30 bg-destructive/10 shadow-sm">
            <CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : issues.length === 0 ? (
          <Card className="border-border/40 bg-background/80 shadow-sm">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No open issues found for this repository. Great job keeping things tidy!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <aside className="flex flex-col gap-6">
              <Card className="sticky top-28 border-border/40 bg-gradient-to-br from-background to-muted/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Issue snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="rounded-xl border border-border/50 bg-background/70 p-3">
                      <p className="text-2xl font-semibold text-foreground">{issueStats.totalIssues}</p>
                      <p className="text-xs text-muted-foreground">Open issues</p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-background/70 p-3">
                      <p className="text-2xl font-semibold text-foreground">{issueStats.totalComments}</p>
                      <p className="text-xs text-muted-foreground">Total comments</p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-background/70 p-3">
                      <p className="text-2xl font-semibold text-foreground">{issueStats.averageComments}</p>
                      <p className="text-xs text-muted-foreground">Avg comments</p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-background/70 p-3">
                      <p className="text-2xl font-semibold text-foreground">{issues[0]?.number ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">Latest issue</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Most recent activity</p>
                      <p>{issueStats.latestIssueCreatedAt ? formatDistanceToNow(new Date(issueStats.latestIssueCreatedAt), { addSuffix: true }) : "—"}</p>
                    </div>
                  </div>
                  {topLabels.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Tag className="h-4 w-4 text-primary" />
                        <div className="flex flex-wrap gap-2">
                          {topLabels.map(([label, count]) => (
                            <Badge key={label} variant="outline" className="rounded-full border-border/60 text-xs">
                              {label} · {count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </aside>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {issues.map((issue) => (
                <Card
                  key={issue.id}
                  className="group flex h-full min-h-[320px] flex-col overflow-hidden border-border/40 bg-background/80 shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="line-clamp-2 text-base leading-snug text-foreground transition-colors group-hover:text-primary">
                          #{issue.number} · {issue.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Opened {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="rounded-full border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                      >
                        <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </a>
                      </Button>
                    </div>
                    {issue.labels.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {issue.labels.map((label) => (
                          <Badge key={label} variant="secondary" className="rounded-full px-2 py-1 text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between gap-4">
                    <ScrollArea className="max-h-32 pr-2">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {issue.body ? issue.body : "No additional description provided."}
                      </p>
                    </ScrollArea>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {issue.comments} comments
                      </span>
                      <Button size="sm" onClick={() => openAnalysisModal(issue)} className="rounded-full px-4">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Analyze Issue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background/95 to-muted/70 p-0 shadow-xl backdrop-blur sm:max-w-5xl">
          <DialogHeader className="items-center space-y-2 text-center">
            <DialogTitle className="text-xl font-semibold">Issue Analysis</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Greptile analyzes the repository to suggest the best way to fix this issue.
            </DialogDescription>
          </DialogHeader>

          {selectedIssue && (
            <div className="space-y-4 px-6 text-center sm:px-8">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  #{selectedIssue.number} · {selectedIssue.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Opened {formatDistanceToNow(new Date(selectedIssue.created_at), { addSuffix: true })} ·{" "}
                  <span>{selectedIssue.comments} comments</span>
                </p>
              </div>
              <ScrollArea className="mx-auto max-h-56 w-full max-w-3xl overflow-hidden rounded-md border border-border/40 p-3">
                <p className="text-sm whitespace-pre-wrap text-left break-words break-all">
                  {selectedIssue.body || "No additional description provided."}
                </p>
              </ScrollArea>
            </div>
          )}

          <Separator />

          {isAnalyzing ? (
            <div className="mx-6 flex items-center justify-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-6 text-sm text-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Analyzing issue with Greptile. This may take a few seconds...
            </div>
          ) : analysisError ? (
            <div className="mx-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
              {analysisError}
            </div>
          ) : analysis ? (
            <div className="space-y-6 px-6 pb-2 text-center">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Step-by-step guidance</h4>
                <ScrollArea className="mx-auto max-h-64 w-full max-w-3xl rounded-2xl border border-border/50 bg-background/80 p-4 text-left">
                  <div className="space-y-3 text-sm leading-relaxed text-muted-foreground break-words">
                    {formattedAnalysisSections.length > 0
                      ? formattedAnalysisSections.map((section, index) => (
                          <p key={index} className="whitespace-pre-wrap">
                            {section}
                          </p>
                        ))
                      : analysis.message.trim()}
                  </div>
                </ScrollArea>
              </div>

              {uniqueSourceFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Files to review
                  </h4>
                  <ul className="mx-auto mt-2 grid max-w-3xl gap-2 text-left text-sm md:grid-cols-2">
                    {uniqueSourceFiles.map((source) => (
                      <li
                        key={source.filepath}
                        className="rounded-xl border border-border/50 bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground"
                      >
                        {source.filepath}
                        <span className="block text-[10px] uppercase tracking-wide text-muted-foreground/70">
                          Lines {source.linestart}-{source.lineend}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="mx-6 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
              Click &ldquo;Analyze Issue&rdquo; to get Greptile guidance.
            </div>
          )}

          <DialogFooter className="flex flex-col items-center justify-center gap-3 border-t border-border/40 bg-muted/10 px-6 py-4 sm:flex-row">
            {selectedIssue ? (
              <Button variant="outline" size="sm" asChild className="rounded-full border-border/60">
                <a href={selectedIssue.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on GitHub
                </a>
              </Button>
            ) : (
              <span />
            )}
            <Button onClick={() => handleModalOpenChange(false)} className="rounded-full px-6">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
