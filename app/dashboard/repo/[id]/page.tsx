import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { RepositoryChat } from "@/components/repository/repository-chat"
import { RepositoryInfo } from "@/components/repository/repository-info"

interface RepositoryPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RepositoryPage({ params }: RepositoryPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch repository details
  const { data: repository, error } = await supabase
    .from("repositories")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !repository) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 flex flex-col">
        <RepositoryInfo repository={repository} />
        <RepositoryChat repository={repository} />
      </main>
    </div>
  )
}
