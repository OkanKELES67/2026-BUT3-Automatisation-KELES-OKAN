import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'

export interface Task {
  id: string
  title: string
  isCompleted: boolean
  createdAt: string
  completedAt?: string | null
}

export interface CreateTaskInput {
  title: string
}

export interface UpdateTaskInput {
  id: string
  title?: string
  isCompleted?: boolean
}

/**
 * Empty by default: `yarn dev` proxies /api to the backend, and the production image is
 * served behind the same origin. Set VITE_API_BASE_URL to talk to an API elsewhere.
 */
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export const tasksQueryKey = ['tasks'] as const

/** Every Storm.Api endpoint answers with this envelope, on success and on failure alike. */
interface ApiEnvelope<T> {
  is_success: boolean
  error_code?: string | null
  error_message?: string | null
  data?: T
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchOrThrow(`${apiBaseUrl}/api/v1${path}`, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
  })

  const envelope = await readEnvelope<T>(response)

  if (!response.ok || envelope?.is_success === false) {
    throw new ApiError(
      envelope?.error_message ?? response.statusText ?? `Request failed with status ${response.status}`,
      response.status,
      envelope?.error_code ?? undefined,
    )
  }

  return envelope?.data as T
}

/** `fetch` only rejects when the request never reached the server: offline, DNS, API down. */
async function fetchOrThrow(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch {
    throw new ApiError('The server is unreachable. Check that the API is running.', 0, 'NETWORK_ERROR')
  }
}

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T> | null> {
  try {
    return (await response.json()) as ApiEnvelope<T>
  } catch {
    return null
  }
}

export function useTasks(): UseQueryResult<Task[]> {
  return useQuery({
    queryKey: tasksQueryKey,
    queryFn: () => request<Task[]>('/tasks'),
  })
}

export function useCreateTask(): UseMutationResult<Task, Error, CreateTaskInput> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksQueryKey }),
  })
}

export function useUpdateTask(): UseMutationResult<Task, Error, UpdateTaskInput> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...changes }: UpdateTaskInput) =>
      request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksQueryKey }),
  })
}

export function useDeleteTask(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksQueryKey }),
  })
}
