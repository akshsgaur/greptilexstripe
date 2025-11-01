// Greptile API client
const GREPTILE_API_URL = "https://api.greptile.com/v2"
const GREPTILE_API_KEY = process.env.GREPTILE_API_KEY

export interface GreptileRepository {
  remote: string
  branch: string
  repository: string
}

export interface GreptileQueryRequest {
  messages: Array<{
    id: string
    content: string
    role: "user" | "assistant"
  }>
  repositories: GreptileRepository[]
  sessionId?: string
}

export interface GreptileQueryResponse {
  message: string
  sources: Array<{
    filepath: string
    linestart: number
    lineend: number
    repository: string
  }>
}

export class GreptileClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || GREPTILE_API_KEY || ""
    this.baseUrl = GREPTILE_API_URL
  }

  async indexRepository(remote: string, repository: string, branch = "main"): Promise<{ repositoryId: string }> {
    const response = await fetch(`${this.baseUrl}/repositories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "X-GitHub-Token": process.env.GITHUB_TOKEN || "",
      },
      body: JSON.stringify({
        remote,
        repository,
        branch,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to index repository: ${error}`)
    }

    return response.json()
  }

  async checkIndexStatus(repositoryId: string): Promise<{
    status: "processing" | "completed" | "failed"
    progress?: number
  }> {
    const response = await fetch(`${this.baseUrl}/repositories/${repositoryId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to check index status")
    }

    return response.json()
  }

  async query(request: GreptileQueryRequest): Promise<GreptileQueryResponse> {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Query failed: ${error}`)
    }

    return response.json()
  }

  async deleteRepository(repositoryId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/repositories/${repositoryId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete repository")
    }
  }
}

export const greptile = new GreptileClient()
