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

    if (!repository.greptile_repository_id) {
      return NextResponse.json({ error: "Repository not indexed" }, { status: 400 })
    }

    // Check index status
    const status = await greptile.checkIndexStatus(repository.greptile_repository_id)

    // Update repository if completed
    if (status.status === "completed" && !repository.is_indexed) {
      await supabase.from("repositories").update({ is_indexed: true }).eq("id", repositoryId)
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
