export interface User {
  id: string
  github_id: string
  email: string
  name: string | null
  avatar_url: string | null
  access_token: string | null
  created_at: string
  updated_at: string
}

export interface Repository {
  id: string
  user_id: string
  name: string
  full_name: string
  owner: string
  branch: string
  is_indexed: boolean
  indexing_status: string | null
  status_endpoint: string | null
  stripe_payment_id: string | null
  created_at: string
  updated_at: string
}
