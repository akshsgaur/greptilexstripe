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

      <main className="flex-1 w-full px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-background/80 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Your Repositories</h1>
              <p className="text-muted-foreground mt-1">Manage and query your connected GitHub repositories</p>
            </div>
            <AddRepositoryDialog />
          </div>

          <RepositoryList repositories={repositories || []} />
        </div>
      </main>
    </div>
  )
}
