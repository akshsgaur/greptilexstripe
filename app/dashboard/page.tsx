import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { RepositoryList } from "@/components/dashboard/repository-list"
import { AddRepositoryDialog } from "@/components/dashboard/add-repository-dialog"

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's repositories
  const { data: repositories } = await supabase
    .from("repositories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Repositories</h1>
            <p className="text-muted-foreground mt-2">Manage and query your connected GitHub repositories</p>
          </div>
          <AddRepositoryDialog />
        </div>

        <RepositoryList repositories={repositories || []} />
      </main>
    </div>
  )
}
