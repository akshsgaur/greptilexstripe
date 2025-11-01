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
    const queryPrompt = `I need help solving this GitHub issue: "${issueTitle}"

Issue Description:
${issueBody || "No additional context provided."}

Based on the codebase, provide:
1. A step-by-step guide to tackle this issue (numbered steps)
2. The specific files that need to be modified
3. Code examples or pseudocode for the solution
4. Potential edge cases to consider
5. How to test the changes
6. Related files or components that might be affected

Make this beginner-friendly with clear explanations.`

    const response = await fetch(`${GREPTILE_API_URL}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${greptileApiKey}`,
        "Content-Type": "application/json",
        "X-GitHub-Token": githubToken,
      },
      body: JSON.stringify({
        messages: [
          {
            id: crypto.randomUUID(),
            content: queryPrompt,
            role: "user",
          },
        ],
        repositories: [
          {
            remote: "github",
            branch: repository.branch,
            repository: repository.full_name,
          },
        ],
        sessionId: effectiveSessionId,
        stream: false,
        genius: true,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("Greptile query error:", response.status, errorBody)
      return NextResponse.json({ error: "Greptile query failed" }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error performing Greptile query:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
