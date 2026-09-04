import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { installFakeApi } from './test/fakeApi'
import { renderWithProviders } from './test/renderWithProviders'

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows the empty state when there is no task', async () => {
    installFakeApi()
    renderWithProviders(<App />)

    expect(await screen.findByText(/nothing to do yet/i)).toBeInTheDocument()
  })

  it('lists the tasks returned by the API', async () => {
    installFakeApi(['Write the Dockerfile', 'Set up the pipeline'])
    renderWithProviders(<App />)

    expect(await screen.findByText('Write the Dockerfile')).toBeInTheDocument()
    expect(screen.getByText('Set up the pipeline')).toBeInTheDocument()
  })

  it('surfaces a loading indicator while the tasks are being fetched', async () => {
    installFakeApi(['Set up the pipeline'])
    renderWithProviders(<App />)

    await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading tasks'))
    expect(screen.getByText('Set up the pipeline')).toBeInTheDocument()
  })

  it('reports an API failure', async () => {
    const api = installFakeApi()
    api.failWith(500, 'Database unreachable')
    renderWithProviders(<App />)

    expect(await screen.findByTestId('notification')).toHaveTextContent(/database unreachable/i)
  })

  it('notifies when the API cannot be reached at all', async () => {
    const api = installFakeApi()
    api.failWithNetworkError()
    renderWithProviders(<App />)

    expect(await screen.findByTestId('notification')).toHaveTextContent(/server is unreachable/i)
  })

  describe('once loaded', () => {
    let api: ReturnType<typeof installFakeApi>

    beforeEach(() => {
      api = installFakeApi(['Set up the pipeline'])
      renderWithProviders(<App />)
    })

    it('adds a task and clears the input', async () => {
      const user = userEvent.setup()
      const input = await screen.findByLabelText('New task')

      await user.type(input, 'Write the Dockerfile')
      await user.click(screen.getByRole('button', { name: /add/i }))

      expect(await screen.findByText('Write the Dockerfile')).toBeInTheDocument()
      await waitFor(() => expect(input).toHaveValue(''))
      expect(await screen.findByTestId('notification')).toHaveTextContent('Task added.')
    })

    it('keeps Add disabled until a non-blank title is typed', async () => {
      const user = userEvent.setup()
      const addButton = await screen.findByRole('button', { name: /add/i })

      expect(addButton).toBeDisabled()

      await user.type(screen.getByLabelText('New task'), '   ')
      expect(addButton).toBeDisabled()

      await user.type(screen.getByLabelText('New task'), 'Real task')
      expect(addButton).toBeEnabled()
    })

    it('toggles a task between done and not done', async () => {
      const user = userEvent.setup()
      const checkbox = await screen.findByRole('checkbox', { name: 'Set up the pipeline' })

      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      await waitFor(() => expect(checkbox).toBeChecked())
      expect(await screen.findByTestId('notification')).toHaveTextContent('Task completed.')

      await user.click(checkbox)
      await waitFor(() => expect(checkbox).not.toBeChecked())
      expect(await screen.findByTestId('notification')).toHaveTextContent('Task reopened.')
    })

    it('deletes a task', async () => {
      const user = userEvent.setup()

      await user.click(await screen.findByRole('button', { name: 'Delete Set up the pipeline' }))

      expect(await screen.findByText(/nothing to do yet/i)).toBeInTheDocument()
      expect(await screen.findByTestId('notification')).toHaveTextContent('Task deleted.')
    })

    it('notifies when an action fails', async () => {
      const user = userEvent.setup()
      const checkbox = await screen.findByRole('checkbox', { name: 'Set up the pipeline' })

      api.failWith(500, 'Database unreachable')
      await user.click(checkbox)

      expect(await screen.findByTestId('notification')).toHaveTextContent(
        'Could not update the task: Database unreachable',
      )
    })
  })
})
