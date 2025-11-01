import { type NextRequest, NextResponse } from "next/server"

import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const repositoryId = searchParams.get("repositoryId")

    if (!repositoryId) {
      return NextResponse.json({ error: "Missing repositoryId" }, { status: 400 })
    }

    const { data: repository, error: repositoryError } = await supabase
      .from("repositories")
      .select("full_name, branch")
      .eq("id", repositoryId)
      .eq("user_id", user.id)
      .single()

    if (repositoryError || !repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    const githubToken = process.env.GITHUB_TOKEN

    if (!githubToken) {
      return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 })
    }

    const response = await fetch(
      `https://api.github.com/repos/${repository.full_name}/issues?state=open&per_page=10&sort=created&direction=desc`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 60 },
      },
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("GitHub API error:", response.status, errorBody)
      return NextResponse.json({ error: "Failed to fetch issues from GitHub" }, { status: response.status })
    }

    const rawIssues = (await response.json()) as any[]

    const issues = rawIssues
      .filter((issue) => !issue.pull_request)
      .map((issue) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        html_url: issue.html_url,
        created_at: issue.created_at,
        comments: issue.comments,
        body: issue.body ?? "",
        labels: Array.isArray(issue.labels)
          ? issue.labels
              .map((label: any) => label?.name)
              .filter((labelName: any): labelName is string => Boolean(labelName))
          : [],
      }))

    return NextResponse.json({ issues })
  } catch (error) {
    console.error("Error fetching GitHub issues:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
