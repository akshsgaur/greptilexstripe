import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { greptile } from "@/lib/greptile"

export async function POST(request: NextRequest) {
  try {
    const { repositoryId, message, history } = await request.json()

    // Verify user authentication
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify repository ownership
    const { data: repository, error: repoError } = await supabase
      .from("repositories")
      .select("*")
      .eq("id", repositoryId)
      .eq("user_id", user.id)
      .single()

    if (repoError || !repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    // Check if repository is indexed
    if (!repository.is_indexed || !repository.greptile_repository_id) {
      return NextResponse.json({
        message: "This repository is still being indexed. Please wait a moment and try again.",
      })
    }

    // Query Greptile
    try {
      const response = await greptile.query({
        messages: [
          ...history.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
          })),
          {
            id: Date.now().toString(),
            content: message,
            role: "user",
          },
        ],
        repositories: [
          {
            remote: "github",
            repository: repository.full_name,
            branch: repository.default_branch,
          },
        ],
      })

      return NextResponse.json({
        message: response.message,
        sources: response.sources,
      })
    } catch (error) {
      console.error("Error querying Greptile:", error)

      // Fallback to mock response if Greptile fails
      const mockResponse = generateMockResponse(message, repository.name)
      return NextResponse.json({
        message: mockResponse,
        sources: [],
      })
    }
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateMockResponse(message: string, repoName: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("what") || lowerMessage.includes("how")) {
    return `Based on the ${repoName} repository, I can help you understand the codebase. However, the AI integration is still being set up. Once connected to Greptile, I'll be able to provide detailed insights about functions, classes, dependencies, and architecture.`
  }

  if (lowerMessage.includes("function") || lowerMessage.includes("method")) {
    return `I can help you find and understand functions in ${repoName}. The Greptile integration will allow me to search through the codebase and provide detailed explanations of how functions work, their parameters, and usage examples.`
  }

  if (lowerMessage.includes("file") || lowerMessage.includes("where")) {
    return `I can help you locate files and understand the project structure of ${repoName}. Once the AI integration is complete, I'll be able to navigate the entire codebase and show you exactly where things are located.`
  }

  return `I understand you're asking about "${message}". The AI-powered code analysis is being set up. Soon, I'll be able to provide detailed answers about the ${repoName} repository, including code explanations, architecture insights, and navigation help.`
}
