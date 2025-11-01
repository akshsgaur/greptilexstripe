import { type NextRequest, NextResponse } from "next/server"

import { createServerClient } from "@/lib/supabase/server"

const GREPTILE_API_URL = "https://api.greptile.com/v2"

export async function POST(request: NextRequest) {
  try {
    const { repositoryId, issueTitle, issueBody, sessionId } = await request.json()

    if (!repositoryId || !issueTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    const greptileApiKey = process.env.GREPTILE_API_KEY
    const githubToken = process.env.GITHUB_TOKEN

    if (!greptileApiKey || !githubToken) {
      return NextResponse.json({ error: "Missing Greptile or GitHub credentials" }, { status: 500 })
    }

    const effectiveSessionId = sessionId || crypto.randomUUID()
    const query = [issueTitle, issueBody].filter(Boolean).join("\n\n").trim()

    const response = await fetch(`${GREPTILE_API_URL}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${greptileApiKey}`,
        "Content-Type": "application/json",
        "X-GitHub-Token": githubToken,
      },
      body: JSON.stringify({
        query,
        repositories: [
          {
            remote: "github",
            branch: repository.branch,
            repository: repository.full_name,
          },
        ],
        sessionId: effectiveSessionId,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("Greptile search error:", response.status, errorBody)
      return NextResponse.json({ error: "Greptile search failed" }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json({ ...result, sessionId: effectiveSessionId })
  } catch (error) {
    console.error("Error performing Greptile search:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
