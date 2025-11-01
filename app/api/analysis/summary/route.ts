import { type NextRequest, NextResponse } from "next/server"

import { createServerClient } from "@/lib/supabase/server"

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

export async function POST(request: NextRequest) {
  try {
    const { repositoryId, issueTitle, issueBody } = await request.json()

    if (!repositoryId || !issueTitle || issueBody === undefined || issueBody === null) {
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
      .select("id")
      .eq("id", repositoryId)
      .eq("user_id", user.id)
      .single()

    if (repositoryError || !repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const safeBody = typeof issueBody === "string" && issueBody.trim().length > 0 ? issueBody : "No detailed description provided."
    const truncatedBody = safeBody.slice(0, 6000)

    const prompt = `You are an experienced software engineer helping a teammate understand how to address a GitHub issue.

GitHub Issue Title:
${issueTitle}

GitHub Issue Description:
${truncatedBody}

Provide a concise assistant note with:
- A one paragraph summary of the problem.
- A numbered list of concrete steps to resolve it.
- Any key files, folders, or components that likely need attention.
- Tests or validation steps to confirm the fix.

Keep the tone actionable and encouraging.`

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a senior software engineer who writes crisp, solution-focused summaries for developer teammates. Always include concrete next steps.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 600,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("OpenAI summary error:", response.status, errorBody)
      return NextResponse.json({ error: "Failed to generate summary" }, { status: response.status })
    }

    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content?.trim()

    if (!summary) {
      return NextResponse.json({ error: "Empty summary returned" }, { status: 502 })
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Error generating issue summary:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
