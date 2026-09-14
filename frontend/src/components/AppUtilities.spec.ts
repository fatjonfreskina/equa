import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import { feedbackApi } from '../api/feedback'
import { setLocale } from '../utils/i18n'
import AppUtilities from './AppUtilities.vue'

vi.mock('../api/feedback', () => ({
  feedbackApi: { options: vi.fn(), submit: vi.fn() },
}))

let app: App | undefined

async function flush(): Promise<void> {
  for (let index = 0; index < 6; index += 1) await nextTick()
}

async function mount(): Promise<void> {
  const container = document.createElement('div')
  document.body.append(container)
  app = createApp(AppUtilities)
  app.mount(container)
  await flush()
}

function button(label: string): HTMLButtonElement {
  return [...document.querySelectorAll<HTMLButtonElement>('button')].find((item) =>
    item.textContent?.includes(label),
  )!
}

beforeEach(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = true
      },
    },
    close: {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = false
      },
    },
  })
  vi.mocked(feedbackApi.options).mockResolvedValue({
    data: { enabled: true, privacy_url: 'https://equa.example/privacy' },
  } as never)
  vi.mocked(feedbackApi.submit).mockResolvedValue({} as never)
})

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.replaceChildren()
  document.documentElement.classList.remove('dark')
  localStorage.clear()
  setLocale('it')
  vi.resetAllMocks()
})

it('groups language, theme and feedback while keeping their controls independent', async () => {
  await mount()
  document.querySelector<HTMLButtonElement>('[aria-controls=app-utilities-panel]')!.click()
  await flush()

  const select = document.querySelector<HTMLSelectElement>('select')!
  const preferenceControls = document.querySelector<HTMLElement>(
    '[data-testid=preference-controls]',
  )!
  expect(preferenceControls.children).toHaveLength(2)
  expect(select.className).toContain('appearance-none')
  expect(document.querySelector('.theme-toggle')?.className).toContain('bg-transparent')
  select.value = 'en'
  select.dispatchEvent(new Event('change'))
  await flush()
  expect(document.body.textContent).toContain('Preferences and feedback')

  button('Dark theme').click()
  expect(document.documentElement.classList.contains('dark')).toBe(true)

  button('Report problem').click()
  await flush()
  expect(document.querySelector<HTMLDialogElement>('dialog')!.open).toBe(true)
})

it('submits only the explicit form fields and confirms success', async () => {
  await mount()
  document.querySelector<HTMLButtonElement>('[aria-controls=app-utilities-panel]')!.click()
  await flush()
  button('Segnala problema').click()
  await flush()
  const textarea = document.querySelector<HTMLTextAreaElement>('textarea')!
  textarea.value = 'Il pulsante non risponde quando salvo.'
  textarea.dispatchEvent(new Event('input'))
  const email = document.querySelector<HTMLInputElement>('input[type=email]')!
  email.value = 'anna@example.org'
  email.dispatchEvent(new Event('input'))
  document
    .querySelector<HTMLFormElement>('dialog form')!
    .dispatchEvent(new Event('submit', { cancelable: true }))
  await flush()

  expect(feedbackApi.submit).toHaveBeenCalledWith({
    category: 'bug',
    message: 'Il pulsante non risponde quando salvo.',
    contact_email: 'anna@example.org',
    locale: 'it',
  })
  expect(document.querySelector('[role=status]')?.textContent).toContain('Grazie')
})

it('keeps preferences usable and hides feedback against an older backend', async () => {
  vi.mocked(feedbackApi.options).mockRejectedValue(new Error('not available'))
  await mount()
  document.querySelector<HTMLButtonElement>('[aria-controls=app-utilities-panel]')!.click()
  await flush()
  expect(document.querySelector('select')).not.toBeNull()
  expect(document.body.textContent).toContain('Tema scuro')
  expect(document.body.textContent).not.toContain('Segnala problema')
})
