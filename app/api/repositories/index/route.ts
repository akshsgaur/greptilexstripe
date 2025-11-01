import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { greptile } from "@/lib/greptile"

export async function POST(request: NextRequest) {
  try {
    const { repositoryId } = await request.json()

    // Verify user authentication
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get repository
    const { data: repository, error: repoError } = await supabase
      .from("repositories")
      .select("*")
      .eq("id", repositoryId)
      .eq("user_id", user.id)
      .single()

    if (repoError || !repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    // Index repository with Greptile
    try {
      const result = await greptile.indexRepository("github", repository.full_name, repository.default_branch)

      // Update repository with Greptile ID
      await supabase
        .from("repositories")
        .update({
          greptile_repository_id: result.repositoryId,
          is_indexed: false, // Will be updated by status check
        })
        .eq("id", repositoryId)

      return NextResponse.json({
        success: true,
        repositoryId: result.repositoryId,
      })
    } catch (error) {
      console.error("Error indexing repository:", error)
      return NextResponse.json({ error: "Failed to index repository" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in index API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
