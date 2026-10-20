const API_BASE_URL = ''

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })

  if (!response.ok) {
    let message = `Falha na solicitação (${response.status})`
    try {
      const body = await response.json()
      message = body.message || body.detail || body.erro || message
    } catch {
      // Keep the HTTP status message for empty or non-JSON responses.
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
