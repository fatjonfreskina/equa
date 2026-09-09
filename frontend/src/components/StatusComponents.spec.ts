import { afterEach, expect, it } from 'vitest'
import { createApp, h, type App } from 'vue'
import StatusBadge from './StatusBadge.vue'
import StatusBanner from './StatusBanner.vue'

let app: App | undefined
type StatusTone = 'info' | 'warning' | 'success'

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.replaceChildren()
})

function mount(component: typeof StatusBadge | typeof StatusBanner, tone: StatusTone) {
  const container = document.createElement('div')
  document.body.append(container)
  app = createApp({ render: () => h(component, { tone }, () => 'Contenuto') })
  app.mount(container)
  return container.firstElementChild!
}

it.each([
  ['info', 'blue'],
  ['warning', 'amber'],
  ['success', 'green'],
] as const)('renders the %s banner with matching light and dark semantic colors', (tone, color) => {
  const banner = mount(StatusBanner, tone)

  expect(banner.textContent).toBe('Contenuto')
  expect(banner.className).toContain(`bg-${color}-50`)
  expect(banner.className).toContain(`dark:bg-${color}-950`)
})

it('keeps warning badge foreground and background paired in dark mode', () => {
  const badge = mount(StatusBadge, 'warning')

  expect(badge.className).toContain('dark:bg-amber-900')
  expect(badge.className).toContain('dark:text-amber-200')
})
