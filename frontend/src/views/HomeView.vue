<template>
  <FeedbackDialog :request="dialog" @respond="respond" />
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-lg mx-auto py-12 px-4">
      <!-- Hero -->
      <div class="text-center mb-10">
        <div class="flex items-center justify-center gap-3 mb-3">
          <img :src="equaLogo" alt="" width="48" height="48" class="flex-shrink-0" />
          <h1 class="text-5xl font-bold text-green-700 tracking-tight">equa</h1>
        </div>
        <p class="text-xl text-gray-700 font-medium mb-2">{{ t('tagline') }}</p>
        <p class="text-sm text-gray-400">{{ t('subtitle') }}</p>
      </div>

      <StatusBanner tone="success" class="mb-4 px-4 py-3 text-sm">
        <span class="font-semibold">{{ t('multiCurrencyNews') }}</span>
        <p class="mt-1">
          {{ t('multiCurrencyNewsText') }}
        </p>
      </StatusBanner>

      <!-- Form crea gruppo -->
      <div class="bg-white rounded-2xl shadow p-6 mb-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ t('createGroup') }}</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('groupName') }}</label>
            <input
              v-model="form.name"
              type="text"
              :placeholder="t('groupNamePlaceholder')"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('description') }}
              <span class="text-gray-400 font-normal">{{ t('optional') }}</span>
            </label>
            <input
              v-model="form.description"
              type="text"
              :placeholder="t('descriptionPlaceholder')"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label for="group-currency" class="block text-sm font-medium text-gray-700 mb-1">{{
              t('defaultCurrency')
            }}</label>
            <select
              id="group-currency"
              v-model="form.currency"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option v-for="currency in CURRENCIES" :key="currency.code" :value="currency.code">
                {{ currency.code }} · {{ currencyName(currency.code, locale) }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-400">
              {{ t('defaultCurrencyHint') }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members') }}</label>
            <div class="space-y-2">
              <div v-for="(member, index) in form.members" :key="index" class="flex gap-2">
                <input
                  v-model="member.name"
                  type="text"
                  :placeholder="`Es. ${exampleNames[index] || t('participant')}`"
                  class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  v-if="form.members.length > 2"
                  @click="removeMember(index)"
                  class="text-gray-300 hover:text-red-400 px-2 transition"
                >
                  ✕
                </button>
              </div>
            </div>
            <button
              @click="addMember"
              class="mt-2 text-sm text-green-600 hover:text-green-800 font-medium"
            >
              {{ t('addParticipant') }}
            </button>
          </div>

          <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

          <button
            @click="createGroup"
            :disabled="loading"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg py-2.5 transition"
          >
            {{ loading ? t('creating') : t('createGroupAction') }}
          </button>
        </div>
      </div>

      <!-- Gruppi salvati sul dispositivo -->
      <section v-if="recentGroups.length" class="bg-white rounded-2xl shadow p-6 mb-4">
        <div class="flex items-start justify-between gap-3 mb-1">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-lg font-semibold text-gray-800">{{ t('recentGroups') }}</h2>
            </div>
            <p class="text-sm text-gray-400">{{ t('localOnly') }}</p>
          </div>
          <button
            type="button"
            class="shrink-0 text-xs font-medium text-gray-400 hover:text-red-500 transition"
            @click="clearHistory"
          >
            {{ t('clearAll') }}
          </button>
        </div>
        <div class="mt-4 space-y-2">
          <div
            v-for="group in recentGroups"
            :key="group.id"
            class="flex items-center gap-2 rounded-xl border border-gray-100 p-3 transition hover:border-green-200 hover:bg-green-50"
          >
            <button
              type="button"
              class="min-w-0 flex-1 text-left"
              @click="openRecentGroup(group.id)"
            >
              <p class="truncate font-medium text-gray-800">{{ group.name }}</p>
              <p class="mt-0.5 text-xs text-gray-400">
                {{ t('memberCount', { count: group.memberCount }) }} ·
                {{ t('expenseCount', { count: group.expenseCount }) }} ·
                {{ formatLastAccess(group.lastAccessedAt) }}
              </p>
            </button>
            <button
              type="button"
              class="shrink-0 px-1 text-lg text-gray-300 transition hover:text-red-400"
              :aria-label="t('removeRecentAria', { name: group.name })"
              @click="removeRecentGroup(group.id, group.name)"
            >
              ×
            </button>
          </div>
        </div>
      </section>

      <!-- Recupera gruppo esistente -->
      <div class="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-1">{{ t('existingGroup') }}</h2>
        <p class="text-sm text-gray-400 mb-3">{{ t('pasteSharedLink') }}</p>
        <div class="flex gap-2">
          <input
            v-model="existingId"
            type="text"
            :placeholder="t('groupLinkOrId')"
            class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            @click="goToGroup"
            class="bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg px-4 py-2 text-sm transition"
          >
            {{ t('go') }}
          </button>
        </div>
        <p v-if="linkError" class="text-red-500 text-sm mt-2">
          {{ linkError }}
        </p>
      </div>

      <!-- Perché Equa -->
      <div class="grid grid-cols-3 gap-3 mb-8">
        <div class="bg-white rounded-xl shadow p-4 text-center">
          <div class="text-2xl mb-1">🔗</div>
          <p class="text-xs font-medium text-gray-700">{{ t('linkOnly') }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ t('linkOnlyText') }}</p>
        </div>
        <div class="bg-white rounded-xl shadow p-4 text-center">
          <div class="text-2xl mb-1">⚖️</div>
          <p class="text-xs font-medium text-gray-700">{{ t('preciseAccounts') }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ t('preciseAccountsText') }}</p>
        </div>
        <div class="bg-white rounded-xl shadow p-4 text-center">
          <div class="text-2xl mb-1">❤️</div>
          <p class="text-xs font-medium text-gray-700">{{ t('freeForever') }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ t('freeForeverText') }}</p>
        </div>
      </div>

      <!-- Footer -->
      <DonationFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { groupsApi } from '../api/groups'
import DonationFooter from '../components/DonationFooter.vue'
import FeedbackDialog from '../components/FeedbackDialog.vue'
import StatusBanner from '../components/StatusBanner.vue'
import { useFeedbackDialog } from '../composables/useFeedbackDialog'
import equaLogo from '../assets/equa-logo.svg'
import { trackEvent } from '../utils/analytics'
import { CURRENCIES, currencyName } from '../utils/currency'
import { useI18n } from '../utils/i18n'
import {
  clearRecentGroups as clearStoredRecentGroups,
  getRecentGroups,
  removeRecentGroup as removeStoredRecentGroup,
  type RecentGroup,
} from '../utils/recentGroups'

const router = useRouter()
const { locale, localeTag, t } = useI18n()
const { dialog, respond, askConfirmation } = useFeedbackDialog()

const exampleNames = ['Marco', 'Giulia', 'Luca', 'Sara', 'Paolo']

const form = reactive({
  name: '',
  description: '',
  currency: 'EUR',
  members: [{ name: '' }, { name: '' }],
})

const existingId = ref('')
const loading = ref(false)
const error = ref('')
const linkError = ref('')
const recentGroups = ref<RecentGroup[]>(getRecentGroups())

function addMember() {
  form.members.push({ name: '' })
}

function removeMember(index: number) {
  form.members.splice(index, 1)
}

async function createGroup() {
  error.value = ''

  if (!form.name.trim()) {
    error.value = t('nameRequired')
    return
  }

  const validMembers = form.members.filter((m) => m.name.trim())
  if (validMembers.length < 2) {
    error.value = t('twoMembersRequired')
    return
  }

  loading.value = true
  try {
    const response = await groupsApi.create({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      currency: form.currency,
      members: validMembers,
    })
    trackEvent('group_created')
    router.push({ path: `/group/${response.data.id}`, query: { created: '1' } })
  } catch {
    error.value = t('genericError')
  } finally {
    loading.value = false
  }
}

function goToGroup() {
  linkError.value = ''
  const input = existingId.value.trim()
  if (!input) return

  const match = input.match(/([a-f0-9-]{36})/)
  if (match) {
    router.push(`/group/${match[1]}`)
  } else {
    linkError.value = t('invalidLink')
  }
}

function openRecentGroup(groupId: string) {
  trackEvent('group_opened_from_recent')
  router.push(`/group/${groupId}`)
}

async function removeRecentGroup(groupId: string, groupName: string) {
  if (
    !(await askConfirmation({
      title: t('removeRecentTitle'),
      message: t('removeRecentMessage', { name: groupName }),
      confirmLabel: t('removeRecentConfirm'),
      destructive: true,
    }))
  )
    return
  recentGroups.value = removeStoredRecentGroup(groupId)
}

async function clearHistory() {
  if (
    !(await askConfirmation({
      title: t('clearHistoryTitle'),
      message: t('clearHistoryMessage'),
      confirmLabel: t('clearHistoryConfirm'),
      destructive: true,
    }))
  )
    return
  clearStoredRecentGroups()
  recentGroups.value = []
}

function formatLastAccess(lastAccessedAt: string) {
  return new Intl.DateTimeFormat(localeTag.value, { dateStyle: 'medium' }).format(
    new Date(lastAccessedAt),
  )
}
</script>
