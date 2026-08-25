<template>
  <div class="max-w-2xl mx-auto py-8 px-4">
    <div v-if="loading" class="text-center py-20 text-gray-400">Caricamento...</div>
    <div v-else-if="error" class="text-center py-20 text-red-500">
      {{ error }}
    </div>

    <div v-else-if="group">
      <!-- Promemoria mostrato solo subito dopo la creazione del gruppo -->
      <div
        v-if="showShareDialog"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-reminder-title"
        @click.self="closeShareDialog"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-2xl" aria-hidden="true">🔗</p>
              <h2 id="share-reminder-title" class="mt-2 text-xl font-bold text-gray-800">
                Condividi il link del gruppo
              </h2>
            </div>
            <button
              type="button"
              class="text-2xl leading-none text-gray-400 hover:text-gray-700"
              aria-label="Chiudi promemoria condivisione"
              @click="closeShareDialog"
            >
              ×
            </button>
          </div>
          <p class="mt-3 text-sm leading-6 text-gray-600">
            Invialo ai partecipanti e conservalo in una chat: senza il link non sarà possibile
            ritrovare questo gruppo su un altro dispositivo.
          </p>
          <div class="mt-5 grid gap-2 sm:grid-cols-2">
            <a
              :href="whatsAppShareUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <svg
                aria-hidden="true"
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.3L3.5 20l1.2-4.4A8.4 8.4 0 1 1 20.5 11.6Z"
                />
                <path
                  d="M9.1 7.8c.2-.5.5-.5.8-.5h.4c.3 0 .5.1.6.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c.5.9 1.2 1.6 2.1 2.1l.6-.5c.2-.2.5-.2.7-.1l1.7.7c.3.1.4.3.4.6v.4c0 .3-.1.6-.5.8-.4.2-1 .3-1.5.1-3-.9-5.4-3.3-6.3-6.3-.2-.5-.1-1.1.1-1.5Z"
                />
              </svg>
              WhatsApp
            </a>
            <button
              type="button"
              class="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              @click="shareGroup"
            >
              <svg
                aria-hidden="true"
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="m8.2 10.8 7.5-4.4M8.2 13.2l7.5 4.4" />
              </svg>
              Condividi…
            </button>
            <button
              type="button"
              class="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:col-span-2"
              @click="copyLink"
            >
              <svg
                aria-hidden="true"
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="9" y="9" width="10" height="10" rx="2" />
                <path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              </svg>
              {{ copied ? '✓ Link copiato' : 'Copia il link' }}
            </button>
          </div>
          <p class="mt-4 break-all rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
            {{ groupLink }}
          </p>
        </div>
      </div>

      <!-- Link home -->
      <div class="mb-4">
        <RouterLink to="/" class="text-sm text-gray-400 hover:text-green-600 transition">
          ← Torna alla home
        </RouterLink>
      </div>

      <!-- Header -->
      <div class="mb-6 flex items-start justify-between gap-4">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1">
            <svg width="24" height="24" viewBox="0 0 64 64" class="flex-shrink-0">
              <rect x="8" y="10" width="48" height="13" rx="6.5" fill="#16a34a" />
              <rect x="8" y="28" width="32" height="13" rx="6.5" fill="#4ade80" />
              <rect x="8" y="46" width="20" height="13" rx="6.5" fill="#86efac" />
            </svg>
            <h1 class="break-words text-2xl font-bold text-green-700">{{ group.name }}</h1>
          </div>
          <p v-if="group.description" class="text-gray-500 text-sm">
            {{ group.description }}
          </p>
        </div>
        <button
          @click="openShareDialog"
          class="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-500 transition hover:text-green-600"
        >
          🔗 Condividi
        </button>
      </div>

      <div
        v-if="!savedLocally"
        class="mb-6 flex items-center justify-between gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3"
      >
        <p class="text-sm text-green-800">
          Ritrova questo gruppo dalla home su questo dispositivo.
        </p>
        <button
          type="button"
          class="shrink-0 text-sm font-semibold text-green-700 underline underline-offset-2 hover:text-green-800"
          @click="saveGroupLocally"
        >
          Salva gruppo
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'pb-2 px-1 text-sm font-medium border-b-2 transition',
            activeTab === tab.key
              ? 'border-green-600 text-green-700'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab: Spese -->
      <div v-if="activeTab === 'expenses'">
        <!-- Totale spese -->
        <div
          class="bg-green-50 border border-green-100 rounded-xl px-5 py-3 mb-4 flex items-center justify-between"
        >
          <span class="text-sm text-green-700 font-medium">Totale spese</span>
          <span class="text-lg font-bold text-green-700"
            >{{ totalExpenses.toFixed(2) }} {{ group.currency }}</span
          >
        </div>

        <!-- Bottone aggiungi -->
        <button
          @click="openNewExpenseForm"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-2.5 mb-4 transition"
        >
          {{ showExpenseForm && !editingExpenseId ? '✕ Annulla' : '+ Aggiungi spesa' }}
        </button>

        <!-- Form aggiunta / modifica spesa -->
        <div v-if="showExpenseForm" class="bg-white rounded-2xl shadow p-5 mb-4">
          <h3 class="font-semibold text-gray-800 mb-3">
            {{ editingExpenseId ? 'Modifica spesa' : 'Nuova spesa' }}
          </h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
              <input
                v-model="expenseForm.description"
                type="text"
                placeholder="Es. Cena al ristorante"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Importo ({{ group.currency }})</label
              >
              <input
                v-model="expenseForm.amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pagato da</label>
              <select
                v-model="expenseForm.paid_by_member_id"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option disabled value="">Seleziona...</option>
                <option v-for="member in group.members" :key="member.id" :value="member.id">
                  {{ member.name }}
                </option>
              </select>
            </div>

            <!-- Tipo split — nascosto in modifica perché usiamo sempre custom -->
            <div v-if="!editingExpenseId">
              <label class="block text-sm font-medium text-gray-700 mb-1">Divisione</label>
              <div class="flex gap-2 flex-wrap">
                <button
                  v-for="type in splitTypes"
                  :key="type.key"
                  @click="expenseForm.splitType = type.key"
                  :class="[
                    'flex-1 py-2 rounded-lg text-sm font-medium border transition',
                    expenseForm.splitType === type.key
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-green-400',
                  ]"
                >
                  {{ type.label }}
                </button>
              </div>
            </div>

            <!-- Split: seleziona persone -->
            <div v-if="expenseForm.splitType === 'subset' && !editingExpenseId" class="space-y-2">
              <p class="text-xs text-gray-500">Seleziona tra chi dividere equamente:</p>
              <div v-for="member in group.members" :key="member.id" class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :id="`subset-${member.id}`"
                  :value="member.id"
                  v-model="expenseForm.subsetIds"
                  class="accent-green-600"
                />
                <label :for="`subset-${member.id}`" class="text-sm text-gray-700 cursor-pointer">
                  {{ member.name }}
                </label>
              </div>
              <p v-if="expenseForm.subsetIds.length > 0" class="text-xs text-green-600">
                {{ (parseFloat(expenseForm.amount) / expenseForm.subsetIds.length).toFixed(2) }}
                {{ group.currency }} a testa
              </p>
            </div>

            <!-- Split personalizzato (sempre visibile in modifica) -->
            <div v-if="expenseForm.splitType === 'custom'" class="space-y-2">
              <div v-for="member in group.members" :key="member.id" class="flex items-center gap-2">
                <span class="flex-1 text-sm text-gray-700">{{ member.name }}</span>
                <input
                  v-model="expenseForm.customSplits[member.id]"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  class="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <p :class="splitSumOk ? 'text-green-600' : 'text-red-500'" class="text-xs text-right">
                Totale split: {{ splitSum.toFixed(2) }} /
                {{ expenseForm.amount || 0 }}
              </p>
            </div>

            <p v-if="expenseError" class="text-red-500 text-sm">
              {{ expenseError }}
            </p>

            <div class="flex gap-2">
              <button
                @click="cancelExpenseForm"
                class="flex-1 border border-gray-300 text-gray-600 font-semibold rounded-lg py-2.5 transition hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                @click="saveExpense"
                :disabled="expenseLoading"
                class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg py-2.5 transition"
              >
                {{ expenseLoading ? 'Salvataggio...' : editingExpenseId ? 'Aggiorna' : 'Salva' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Lista spese -->
        <div v-if="group.expenses.length === 0" class="text-center py-10 text-gray-400">
          Nessuna spesa ancora. Aggiungine una!
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="expense in [...group.expenses].reverse()"
            :key="expense.id"
            class="bg-white rounded-2xl shadow px-5 py-4 flex items-center justify-between cursor-pointer hover:shadow-md transition"
            @click="openEditExpenseForm(expense)"
          >
            <div>
              <p class="font-medium text-gray-800">{{ expense.description }}</p>
              <p class="text-sm text-gray-500">
                Pagato da
                <span class="font-medium">{{ memberName(expense.paid_by_member_id) }}</span>
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-bold text-green-700"
                >{{ expense.amount }} {{ group.currency }}</span
              >
              <button
                @click.stop="deleteExpense(expense.id)"
                class="text-gray-300 hover:text-red-400 transition text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Bilanci -->
      <div v-if="activeTab === 'balances'">
        <div v-if="balancesLoading" class="text-center py-10 text-gray-400">Calcolo...</div>
        <div v-else-if="balances.length === 0" class="text-center py-10 text-gray-400">
          Nessun debito! Siete tutti pari 🎉
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(balance, i) in balances"
            :key="i"
            class="bg-white rounded-2xl shadow px-5 py-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-2 text-gray-700">
              <span class="font-medium">{{ balance.from_member_name }}</span>
              <span class="text-gray-400">→</span>
              <span class="font-medium">{{ balance.to_member_name }}</span>
            </div>
            <span class="font-bold text-red-500">{{ balance.amount }} {{ group.currency }}</span>
          </div>
        </div>
      </div>

      <!-- Tab: Partecipanti -->
      <div v-if="activeTab === 'members'">
        <!-- Bottone toggle, stesso pattern della tab Spese -->
        <button
          @click="toggleAddMemberForm"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-2.5 mb-4 transition"
        >
          {{ showAddMemberForm ? '✕ Annulla' : '+ Aggiungi partecipante' }}
        </button>

        <div
          v-if="showAddMemberForm"
          class="bg-white rounded-2xl shadow p-4 mb-4 flex flex-col sm:flex-row gap-2"
        >
          <input
            v-model="newMember.name"
            placeholder="Nome"
            class="min-w-0 flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <input
            v-model="newMember.email"
            placeholder="Email (opzionale)"
            class="min-w-0 flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            @click="addMember"
            class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm shrink-0 w-full sm:w-auto"
          >
            Aggiungi
          </button>
        </div>
        <p v-if="addMemberError" class="text-xs text-red-400 mb-2">{{ addMemberError }}</p>

        <div class="bg-white rounded-2xl shadow divide-y divide-gray-100">
          <div
            v-for="member in group.members"
            :key="member.id"
            class="px-5 py-3 flex items-center justify-between gap-3"
          >
            <div class="min-w-0 flex-1">
              <span class="font-medium text-gray-800">{{ member.name }}</span>

              <span
                v-if="editingEmailId !== member.id"
                @click="startEditEmail(member)"
                class="text-sm text-gray-400 ml-2 cursor-pointer hover:text-green-600 transition"
              >
                {{ member.email || '+ aggiungi email' }}
              </span>

              <div v-else class="flex items-center gap-2 mt-1">
                <input
                  v-model="editingEmailValue"
                  type="email"
                  placeholder="email@esempio.com"
                  class="min-w-0 flex-1 border rounded-lg px-2 py-1 text-sm"
                  @keyup.enter="saveEmail(member.id)"
                  @keyup.esc="cancelEditEmail"
                />
                <button
                  @click="saveEmail(member.id)"
                  class="text-green-600 hover:text-green-700 text-sm font-medium px-1"
                >
                  Salva
                </button>
                <button
                  @click="cancelEditEmail"
                  class="text-gray-400 hover:text-gray-600 text-sm px-1"
                >
                  Annulla
                </button>
              </div>
            </div>

            <!-- il bottone elimina sparisce mentre stai editando l'email di QUESTO membro -->
            <button
              v-if="editingEmailId !== member.id"
              @click="deleteMember(member.id, member.name)"
              class="text-gray-300 hover:text-red-400 transition text-lg shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-3 text-center">
          Un partecipante può essere rimosso solo se non è coinvolto in nessuna spesa.
        </p>
      </div>

      <!-- Footer donazione -->
      <div class="mt-10">
        <DonationFooter />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { groupsApi, type Group, type Balance, type Expense } from '../api/groups'
import DonationFooter from '../components/DonationFooter.vue'
import { isRecentGroup, saveRecentGroup } from '../utils/recentGroups'

const route = useRoute()
const router = useRouter()
const groupId = route.params.id as string

const group = ref<Group | null>(null)
const balances = ref<Balance[]>([])
const loading = ref(true)
const error = ref('')
const copied = ref(false)
const showShareDialog = ref(route.query.created === '1')
const savedLocally = ref(route.query.created === '1' || isRecentGroup(groupId))
const activeTab = ref('expenses')
const balancesLoading = ref(false)

const newMember = reactive({ name: '', email: '' })
const addMemberError = ref('')

const tabs = [
  { key: 'expenses', label: '💸 Spese' },
  { key: 'balances', label: '⚖️ Bilanci' },
  { key: 'members', label: '👥 Partecipanti' },
]

const showExpenseForm = ref(false)
const editingExpenseId = ref<number | null>(null)
const expenseLoading = ref(false)
const expenseError = ref('')
const expenseForm = reactive({
  description: '',
  amount: '',
  paid_by_member_id: '' as number | string,
  splitType: 'equal',
  customSplits: {} as Record<number, string>,
  subsetIds: [] as number[],
})

const showAddMemberForm = ref(false)
const editingEmailId = ref<number | null>(null)
const editingEmailValue = ref('')

const splitTypes = [
  { key: 'equal', label: 'Tutti' },
  { key: 'subset', label: 'Seleziona persone' },
  { key: 'custom', label: 'Personalizzato' },
]

const totalExpenses = computed(() => {
  if (!group.value) return 0
  return group.value.expenses.reduce((acc, e) => acc + parseFloat(String(e.amount)), 0)
})

const groupLink = computed(() => new URL(`/group/${groupId}`, window.location.origin).toString())

const shareMessage = computed(() => {
  if (!group.value) return groupLink.value
  return `Ho creato il gruppo "${group.value.name}" su Equa. Aprilo qui per aggiungere o controllare le spese: ${groupLink.value}`
})

const whatsAppShareUrl = computed(
  () => `https://wa.me/?text=${encodeURIComponent(shareMessage.value)}`,
)

const splitSum = computed(() => {
  return Object.values(expenseForm.customSplits).reduce((acc, v) => acc + (parseFloat(v) || 0), 0)
})

const splitSumOk = computed(() => {
  const amount = parseFloat(expenseForm.amount)
  return Math.abs(splitSum.value - amount) < 0.02
})

async function loadGroup() {
  try {
    const res = await groupsApi.get(groupId)
    group.value = res.data
    if (route.query.created === '1' || savedLocally.value) {
      saveRecentGroup(res.data)
      savedLocally.value = true
    }
  } catch {
    error.value = 'Gruppo non trovato.'
  } finally {
    loading.value = false
  }
}

async function loadBalances() {
  balancesLoading.value = true
  try {
    const res = await groupsApi.getBalances(groupId)
    balances.value = res.data
  } finally {
    balancesLoading.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'balances') loadBalances()
})

function memberName(id: number) {
  return group.value?.members.find((m) => m.id === id)?.name || 'Sconosciuto'
}

function toggleAddMemberForm() {
  showAddMemberForm.value = !showAddMemberForm.value
  if (!showAddMemberForm.value) {
    newMember.name = ''
    newMember.email = ''
    addMemberError.value = ''
  }
}

function startEditEmail(member: { id: number; email?: string | null }) {
  editingEmailId.value = member.id
  editingEmailValue.value = member.email || ''
}

function cancelEditEmail() {
  editingEmailId.value = null
  editingEmailValue.value = ''
}

async function saveEmail(memberId: number) {
  try {
    await groupsApi.updateMember(groupId, memberId, { email: editingEmailValue.value.trim() })
    editingEmailId.value = null
    await loadGroup()
  } catch (e: any) {
    alert(e?.response?.data?.detail || "Errore durante l'aggiornamento dell'email")
  }
}

function resetExpenseForm() {
  expenseForm.description = ''
  expenseForm.amount = ''
  expenseForm.paid_by_member_id = ''
  expenseForm.splitType = 'equal'
  expenseForm.customSplits = {}
  expenseForm.subsetIds = []
  expenseError.value = ''
  editingExpenseId.value = null
}

function openNewExpenseForm() {
  if (showExpenseForm.value && !editingExpenseId.value) {
    showExpenseForm.value = false
    resetExpenseForm()
    return
  }
  resetExpenseForm()
  showExpenseForm.value = true
}

function openEditExpenseForm(expense: Expense) {
  resetExpenseForm()
  editingExpenseId.value = expense.id
  expenseForm.description = expense.description
  expenseForm.amount = String(expense.amount)
  expenseForm.paid_by_member_id = expense.paid_by_member_id
  expenseForm.splitType = 'custom'
  expense.splits.forEach((s) => {
    expenseForm.customSplits[s.member_id] = String(s.share_amount)
  })
  showExpenseForm.value = true
}

function cancelExpenseForm() {
  showExpenseForm.value = false
  resetExpenseForm()
}

async function saveExpense() {
  expenseError.value = ''
  if (!expenseForm.description.trim()) {
    expenseError.value = 'Inserisci una descrizione'
    return
  }
  if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
    expenseError.value = 'Inserisci un importo valido'
    return
  }
  if (!expenseForm.paid_by_member_id) {
    expenseError.value = 'Seleziona chi ha pagato'
    return
  }
  if (expenseForm.splitType === 'custom' && !splitSumOk.value) {
    expenseError.value = 'La somma degli split non corrisponde al totale'
    return
  }

  expenseLoading.value = true
  try {
    if (editingExpenseId.value) {
      const splits = Object.entries(expenseForm.customSplits)
        .filter(([, v]) => parseFloat(v) > 0)
        .map(([id, v]) => ({
          member_id: parseInt(id),
          share_amount: parseFloat(v),
        }))
      await groupsApi.updateExpense(groupId, editingExpenseId.value, {
        paid_by_member_id: expenseForm.paid_by_member_id as number,
        description: expenseForm.description.trim(),
        amount: parseFloat(expenseForm.amount),
        splits,
      })
    } else if (expenseForm.splitType === 'equal') {
      await groupsApi.addExpenseEqual(groupId, {
        paid_by_member_id: expenseForm.paid_by_member_id as number,
        description: expenseForm.description.trim(),
        amount: parseFloat(expenseForm.amount),
      })
    } else if (expenseForm.splitType === 'subset') {
      if (expenseForm.subsetIds.length === 0) {
        expenseError.value = 'Seleziona almeno una persona'
        expenseLoading.value = false
        return
      }
      await groupsApi.addExpenseSubset(groupId, {
        paid_by_member_id: expenseForm.paid_by_member_id as number,
        description: expenseForm.description.trim(),
        amount: parseFloat(expenseForm.amount),
        member_ids: expenseForm.subsetIds,
      })
    } else {
      const splits = Object.entries(expenseForm.customSplits)
        .filter(([, v]) => parseFloat(v) > 0)
        .map(([id, v]) => ({
          member_id: parseInt(id),
          share_amount: parseFloat(v),
        }))
      await groupsApi.addExpense(groupId, {
        paid_by_member_id: expenseForm.paid_by_member_id as number,
        description: expenseForm.description.trim(),
        amount: parseFloat(expenseForm.amount),
        splits,
      })
    }
    await loadGroup()
    showExpenseForm.value = false
    resetExpenseForm()
  } catch {
    expenseError.value = 'Errore nel salvataggio. Riprova.'
  } finally {
    expenseLoading.value = false
  }
}

async function deleteExpense(expenseId: number) {
  if (!confirm('Eliminare questa spesa?')) return
  await groupsApi.deleteExpense(groupId, expenseId)
  await loadGroup()
}

async function deleteMember(memberId: number, name: string) {
  if (!confirm(`Rimuovere ${name} dal gruppo?`)) return
  try {
    await groupsApi.deleteMember(groupId, memberId)
    await loadGroup()
  } catch (e: any) {
    const msg = e?.response?.data?.detail || 'Impossibile rimuovere il partecipante.'
    alert(msg)
  }
}

async function addMember() {
  addMemberError.value = ''
  if (!newMember.name.trim()) {
    addMemberError.value = 'Inserisci un nome'
    return
  }
  try {
    await groupsApi.addMember(groupId, {
      name: newMember.name.trim(),
      email: newMember.email.trim() || undefined,
    })
    newMember.name = ''
    newMember.email = ''
    showAddMemberForm.value = false
    await loadGroup()
  } catch (e: any) {
    addMemberError.value = e?.response?.data?.detail || "Errore durante l'aggiunta"
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(groupLink.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Il link resta visibile nel promemoria e può essere copiato manualmente.
  }
}

async function shareGroup() {
  if (!navigator.share) {
    await copyLink()
    return
  }

  try {
    await navigator.share({
      title: group.value?.name || 'Gruppo Equa',
      text: shareMessage.value,
      url: groupLink.value,
    })
  } catch {
    // La chiusura del foglio di condivisione non è un errore da mostrare all'utente.
  }
}

function openShareDialog() {
  showShareDialog.value = true
}

function closeShareDialog() {
  showShareDialog.value = false
  if (route.query.created === '1') {
    router.replace({ query: { ...route.query, created: undefined } })
  }
}

function saveGroupLocally() {
  if (!group.value) return
  saveRecentGroup(group.value)
  savedLocally.value = true
}

onMounted(loadGroup)
</script>
