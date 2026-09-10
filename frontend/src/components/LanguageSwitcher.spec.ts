import { afterEach, describe, expect, it } from 'vitest'
import { createApp, nextTick } from 'vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import { setLocale } from '../utils/i18n'

afterEach(() => {
  setLocale('it')
  localStorage.clear()
  document.body.replaceChildren()
})

describe('LanguageSwitcher', () => {
  it('changes all reactive labels and saves the preference on the device', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const app = createApp(LanguageSwitcher)
    app.mount(container)

    const select = container.querySelector('select')!
    select.value = 'en'
    select.dispatchEvent(new Event('change'))
    await nextTick()

    expect(select.getAttribute('aria-label')).toBe('Language')
    expect(localStorage.getItem('equa.locale')).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    app.unmount()
  })
})
