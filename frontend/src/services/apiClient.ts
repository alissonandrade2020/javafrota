const API_BASE_URL = ''
let csrfToken: string | null = null

async function ensureCsrfToken() {
  if (csrfToken) return csrfToken
  const response = await fetch(`${API_BASE_URL}/api/auth/csrf`, { credentials: 'include' })
  if (!response.ok) throw new Error('Não foi possível preparar uma sessão segura.')
  const body = await response.json() as { token: string }
  csrfToken = body.token
  return csrfToken
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase()
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) headers.set('X-XSRF-TOKEN', await ensureCsrfToken())
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
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
