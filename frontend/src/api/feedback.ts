import client from './client'
import type { AppLocale } from '../utils/i18n'

export type FeedbackCategory = 'bug' | 'feature'

export interface FeedbackOptions {
  enabled: boolean
  privacy_url: string | null
}

export const feedbackApi = {
  options: () => client.get<FeedbackOptions>('/feedback/options'),
  submit: (data: {
    category: FeedbackCategory
    message: string
    contact_email: string | null
    locale: AppLocale
  }) => client.post<void>('/feedback', data),
}
