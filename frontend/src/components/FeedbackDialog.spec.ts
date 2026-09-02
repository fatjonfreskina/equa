import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, type App } from 'vue'
import FeedbackDialog from './FeedbackDialog.vue'
import { useFeedbackDialog } from '../composables/useFeedbackDialog'

let app: App | undefined
let feedback: ReturnType<typeof useFeedbackDialog>
let trigger: HTMLButtonElement
const options = { title: 'Eliminare la spesa?', message: 'Cena <b>insieme</b>', destructive: true }

beforeEach(() => {
  // jsdom has no modal top layer: only mock the native open/close primitives.
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
  trigger = document.createElement('button')
  document.body.append(trigger)
  trigger.focus()
  const container = document.createElement('div')
  document.body.append(container)
  app = createApp(
    defineComponent({
      setup() {
        feedback = useFeedbackDialog()
        return () =>
          h(FeedbackDialog, { request: feedback.dialog.value, onRespond: feedback.respond })
      },
    }),
  )
  app.mount(container)
})

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.replaceChildren()
  document.body.style.overflow = ''
  vi.restoreAllMocks()
})

describe('FeedbackDialog', () => {
  it('labels the dialog, renders messages as text and focuses cancellation', async () => {
    const result = feedback.askConfirmation(options)
    await nextTick()
    const modal = document.querySelector('dialog')!
    expect(modal.open).toBe(true)
    expect(modal.getAttribute('role')).toBe('dialog')
    expect(document.getElementById(modal.getAttribute('aria-labelledby')!)?.textContent).toBe(
      options.title,
    )
    expect(document.getElementById(modal.getAttribute('aria-describedby')!)?.textContent).toContain(
      options.message,
    )
    expect(modal.querySelector('b')).toBeNull()
    expect(document.activeElement?.textContent?.trim()).toBe('Annulla')
    expect(document.body.style.overflow).toBe('hidden')
    feedback.respond(false)
    expect(await result).toBe(false)
  })

  it('confirms only via the affirmative button and restores focus and scrolling', async () => {
    document.body.style.overflow = 'auto'
    const result = feedback.askConfirmation({ ...options, confirmLabel: 'Elimina spesa' })
    await nextTick()
    document.querySelectorAll<HTMLButtonElement>('dialog button')[1]!.click()
    expect(await result).toBe(true)
    await nextTick()
    expect(document.querySelector('dialog')!.open).toBe(false)
    expect(document.activeElement).toBe(trigger)
    expect(document.body.style.overflow).toBe('auto')
  })

  it('cancels with the button or Escape without accepting the action', async () => {
    for (const method of ['button', 'escape']) {
      const result = feedback.askConfirmation(options)
      await nextTick()
      if (method === 'button') document.querySelector<HTMLButtonElement>('dialog button')!.click()
      else
        document.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true }))
      expect(await result).toBe(false)
      await nextTick()
      expect(document.activeElement).toBe(trigger)
    }
  })

  it('does not dismiss a destructive confirmation on backdrop clicks', async () => {
    const result = feedback.askConfirmation(options)
    await nextTick()
    document.querySelector('dialog')!.click()
    expect(feedback.dialog.value).not.toBeNull()
    feedback.respond(false)
    await result
  })

  it('shows an accessible alert with a single acknowledgement button', async () => {
    const result = feedback.showAlert({ title: 'Operazione non riuscita', message: 'Riprova.' })
    await nextTick()
    expect(document.querySelector('dialog')!.getAttribute('role')).toBe('alertdialog')
    expect(document.querySelectorAll('dialog button')).toHaveLength(1)
    expect(document.activeElement?.textContent?.trim()).toBe('Ho capito')
    document.querySelector<HTMLButtonElement>('dialog button')!.click()
    expect(await result).toBe(true)
  })

  it('rejects duplicate requests without overwriting the pending confirmation', async () => {
    const first = feedback.askConfirmation(options)
    expect(await feedback.askConfirmation({ title: 'Altro', message: 'Altro' })).toBe(false)
    expect(feedback.dialog.value?.title).toBe(options.title)
    feedback.respond(true)
    expect(await first).toBe(true)
  })

  it('cancels pending work and restores scroll when the view unmounts', async () => {
    const result = feedback.askConfirmation(options)
    await nextTick()
    app?.unmount()
    app = undefined
    expect(await result).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })
})
