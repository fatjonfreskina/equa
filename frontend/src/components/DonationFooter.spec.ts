import { afterEach, expect, it, vi } from 'vitest'
import { createApp, type App } from 'vue'
import DonationFooter from './DonationFooter.vue'
import { DONATION_URL } from '../config'

vi.mock('../utils/analytics', () => ({ trackEvent: vi.fn() }))

let app: App | undefined

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.replaceChildren()
})

it('uses a single safe Buy Me a Coffee link', () => {
  const container = document.createElement('div')
  document.body.append(container)
  app = createApp(DonationFooter)
  app.mount(container)

  const donationLinks = [...container.querySelectorAll<HTMLAnchorElement>('a')].filter(
    (link) => link.href === DONATION_URL,
  )

  expect(donationLinks).toHaveLength(1)
  expect(donationLinks[0]?.getAttribute('target')).toBe('_blank')
  expect(donationLinks[0]?.getAttribute('rel')).toBe('noopener noreferrer')
  expect(container.innerHTML).not.toContain('paypal.me')
})
