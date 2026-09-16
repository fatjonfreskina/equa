import { afterEach, expect, it } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { setLocale } from '../utils/i18n'
import PrivacyView from './PrivacyView.vue'

let app: App | undefined

async function mountPrivacy(): Promise<void> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/privacy', component: PrivacyView },
    ],
  })
  await router.push('/privacy')
  const container = document.createElement('div')
  document.body.append(container)
  app = createApp(PrivacyView).use(router)
  app.mount(container)
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.replaceChildren()
  setLocale('it')
  localStorage.clear()
})

it('describes the actual optional email, feedback, analytics and local-storage flows', async () => {
  await mountPrivacy()
  expect(document.querySelector('h1')?.textContent).toBe('Informativa privacy')
  expect(document.body.textContent).toContain('Conservazione facoltativa del link via email')
  expect(document.body.textContent).toContain('Feedback facoltativo')
  expect(document.body.textContent).toContain('Metriche opzionali')
  expect(document.body.textContent).toContain('Dati salvati sul dispositivo')
  expect(document.querySelector('a[href="/"]')).not.toBeNull()
})

it('reacts to the saved interface language', async () => {
  setLocale('en')
  await mountPrivacy()
  expect(document.querySelector('h1')?.textContent).toBe('Privacy notice')
  expect(document.body.textContent).toContain('Optional group-link email')
  expect(document.body.textContent).toContain('Optional feedback')
})
