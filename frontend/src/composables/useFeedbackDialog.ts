import { onScopeDispose, readonly, shallowRef } from 'vue'

export interface FeedbackDialogOptions {
  title: string
  message: string
  confirmLabel?: string
  destructive?: boolean
}

export interface FeedbackDialogRequest extends FeedbackDialogOptions {
  kind: 'alert' | 'confirm'
}

// Each view owns its dialogs: navigating away cancels pending confirmations.
export function useFeedbackDialog() {
  const dialog = shallowRef<FeedbackDialogRequest | null>(null)
  let resolveDialog: ((confirmed: boolean) => void) | undefined
  let disposed = false

  function respond(confirmed: boolean) {
    const resolve = resolveDialog
    resolveDialog = undefined
    dialog.value = null
    resolve?.(confirmed)
  }

  function open(kind: FeedbackDialogRequest['kind'], options: FeedbackDialogOptions) {
    // Never replace an unanswered request or execute a duplicate action.
    if (disposed || dialog.value) return Promise.resolve(false)
    dialog.value = { ...options, kind }
    return new Promise<boolean>((resolve) => {
      resolveDialog = resolve
    })
  }

  onScopeDispose(() => {
    disposed = true
    respond(false)
  })

  return {
    dialog: readonly(dialog),
    respond,
    askConfirmation: (options: FeedbackDialogOptions) => open('confirm', options),
    showAlert: (options: FeedbackDialogOptions) => open('alert', options),
  }
}
