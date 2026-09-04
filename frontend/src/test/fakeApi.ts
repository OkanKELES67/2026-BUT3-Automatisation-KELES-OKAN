import { vi } from 'vitest'
import type { Task } from '../api/tasks'

interface FakeApi {
  tasks: Task[]
  /** Makes every subsequent call fail, so the error paths can be exercised. */
  failWith: (status: number, errorMessage?: string) => void
  /** Makes every subsequent call reject, as if the API were not running at all. */
  failWithNetworkError: () => void
}

let nextId = 0

function makeTask(title: string): Task {
  nextId += 1

  return {
    id: `00000000-0000-0000-0000-${String(nextId).padStart(12, '0')}`,
    title,
    isCompleted: false,
    createdAt: new Date(Date.UTC(2026, 0, 1, 12, nextId)).toISOString(),
    completedAt: null,
  }
}

/** Mirrors the Storm.Api response envelope the real endpoints return. */
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ is_success: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function error(status: number, errorCode: string, errorMessage: string): Response {
  return new Response(
    JSON.stringify({ is_success: false, error_code: errorCode, error_message: errorMessage }),
    { status, headers: { 'Content-Type': 'application/json' } },
  )
}

/**
 * Replaces global fetch with a tiny in-memory stand-in for the API, so the components,
 * the query cache and the fetch layer are all exercised for real.
 */
export function installFakeApi(initialTitles: string[] = []): FakeApi {
  nextId = 0

  const state: FakeApi = {
    tasks: initialTitles.map(makeTask).reverse(),
    failWith: (status, errorMessage) => {
      failure = { status, errorMessage: errorMessage ?? 'Something went wrong' }
    },
    failWithNetworkError: () => {
      unreachable = true
    },
  }

  let failure: { status: number; errorMessage: string } | null = null
  let unreachable = false

  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (unreachable) {
      throw new TypeError('Failed to fetch')
    }

    if (failure) {
      return error(failure.status, 'GENERIC_HTTP_ERROR', failure.errorMessage)
    }

    const url = new URL(input.toString(), 'http://localhost')
    const method = init?.method ?? 'GET'
    const idMatch = /^\/api\/v1\/tasks\/(?<id>[^/]+)$/.exec(url.pathname)

    if (url.pathname === '/api/v1/tasks' && method === 'GET') {
      return json(state.tasks)
    }

    if (url.pathname === '/api/v1/tasks' && method === 'POST') {
      const { title } = JSON.parse(String(init?.body)) as { title: string }
      const task = makeTask(title)
      state.tasks = [task, ...state.tasks]

      return json(task)
    }

    if (idMatch?.groups && method === 'PUT') {
      const changes = JSON.parse(String(init?.body)) as Partial<Task>
      const task = state.tasks.find((candidate) => candidate.id === idMatch.groups!.id)
      if (!task) {
        return error(404, 'TASK_NOT_FOUND', 'Task not found.')
      }

      Object.assign(task, changes)
      task.completedAt = task.isCompleted ? new Date().toISOString() : null

      return json(task)
    }

    if (idMatch?.groups && method === 'DELETE') {
      state.tasks = state.tasks.filter((candidate) => candidate.id !== idMatch.groups!.id)

      return json(undefined)
    }

    return error(404, 'NOT_FOUND', 'Not found.')
  }))

  return state
}
