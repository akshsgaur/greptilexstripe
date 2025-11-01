import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { GitHubClient } from "@/lib/github"

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's GitHub token from session or database
    // This assumes you store the GitHub OAuth token
    const githubToken = process.env.GITHUB_TOKEN // Replace with actual token retrieval

    if (!githubToken) {
      return NextResponse.json({ error: "GitHub token not found" }, { status: 400 })
    }

    const github = new GitHubClient(githubToken)
    const repositories = await github.getUserRepositories()

    return NextResponse.json({ repositories })
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
