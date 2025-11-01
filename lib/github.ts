// GitHub API client
const GITHUB_API_URL = "https://api.github.com"

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  default_branch: string
  private: boolean
  owner: {
    login: string
    avatar_url: string
  }
}

export class GitHubClient {
  private token: string
  private baseUrl: string

  constructor(token: string) {
    this.token = token
    this.baseUrl = GITHUB_API_URL
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch repository")
    }

    return response.json()
  }

  async getUserRepositories(): Promise<GitHubRepository[]> {
    const response = await fetch(`${this.baseUrl}/user/repos?per_page=100`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch repositories")
    }

    return response.json()
  }

  async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<string> {
    const url = ref
      ? `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`
      : `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch file content")
    }

    const data = await response.json()
    return Buffer.from(data.content, "base64").toString("utf-8")
  }
}
