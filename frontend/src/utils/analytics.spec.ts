import { afterEach, describe, expect, it, vi } from 'vitest'

const websiteId = 'e676c9b4-11e4-4ef1-a4d7-87001773e9f2'

afterEach(() => {
  document.head.innerHTML = ''
  delete window.umami
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('analytics', () => {
  it('includes the required website ID in queued manual pageviews', async () => {
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', websiteId)
    const track = vi.fn()
    window.umami = { track }
    const { initAnalytics, trackPageview } = await import('./analytics')

    initAnalytics()
    trackPageview('/group')
    document
      .querySelector<HTMLScriptElement>('[data-equa-analytics]')
      ?.dispatchEvent(new Event('load'))

    expect(track).toHaveBeenCalledWith({
      website: websiteId,
      url: '/group',
      title: 'Gruppo Equa',
    })
  })
})
