type UmamiPayload = { url: string; title: string }

declare global {
  interface Window {
    umami?: {
      track: (event: string | UmamiPayload) => void
    }
  }
}

const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID
const pendingTracks: Array<string | UmamiPayload> = []
let trackerLoaded = false

export function initAnalytics() {
  if (!websiteId || document.querySelector('[data-equa-analytics]')) return

  const script = document.createElement('script')
  script.defer = true
  script.src = 'https://cloud.umami.is/script.js'
  script.dataset.websiteId = websiteId
  script.dataset.autoPageview = 'false'
  script.dataset.equaAnalytics = 'true'
  script.addEventListener('load', () => {
    trackerLoaded = true
    pendingTracks.splice(0).forEach((track) => window.umami?.track(track))
  })
  document.head.appendChild(script)
}

export function trackPageview(path: '/' | '/group') {
  track({ url: path, title: path === '/' ? 'Equa' : 'Gruppo Equa' })
}

export function trackEvent(
  event:
    | 'group_created'
    | 'group_opened_from_recent'
    | 'expense_created'
    | 'share_opened'
    | 'share_whatsapp'
    | 'share_copied'
    | 'closing_started'
    | 'settlement_reported'
    | 'settlement_confirmed'
    | 'group_closed'
    | 'donation_clicked',
) {
  track(event)
}

function track(value: string | UmamiPayload) {
  if (!websiteId) return
  if (trackerLoaded && window.umami) {
    window.umami.track(value)
  } else {
    pendingTracks.push(value)
  }
}
