<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-lg mx-auto py-12 px-4">

      <!-- Hero -->
      <div class="text-center mb-10">
        <div class="flex items-center justify-center gap-3 mb-3">
          <svg width="48" height="48" viewBox="0 0 64 64" class="flex-shrink-0">
            <rect x="8"  y="10" width="48" height="13" rx="6.5" fill="#16a34a"/>
            <rect x="8"  y="28" width="32" height="13" rx="6.5" fill="#4ade80"/>
            <rect x="8"  y="46" width="20" height="13" rx="6.5" fill="#86efac"/>
          </svg>
          <h1 class="text-5xl font-bold text-green-700 tracking-tight">equa</h1>
        </div>
        <p class="text-xl text-gray-700 font-medium mb-2">Dividi le spese, non le amicizie.</p>
        <p class="text-sm text-gray-400">Semplice, italiano, e gratis per sempre.</p>
      </div>

      <!-- Form crea gruppo -->
      <div class="bg-white rounded-2xl shadow p-6 mb-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Crea un gruppo</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome del gruppo</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Es. Vacanza in Sardegna"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Descrizione <span class="text-gray-400 font-normal">(opzionale)</span>
            </label>
            <input
              v-model="form.description"
              type="text"
              placeholder="Es. Agosto 2025, casa al mare"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valuta</label>
            <select
              v-model="form.currency"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="EUR">EUR €</option>
              <option value="USD">USD $</option>
              <option value="GBP">GBP £</option>
              <option value="CHF">CHF ₣</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Partecipanti</label>
            <div class="space-y-2">
              <div
                v-for="(member, index) in form.members"
                :key="index"
                class="flex gap-2"
              >
                <input
                  v-model="member.name"
                  type="text"
                  :placeholder="`Es. ${exampleNames[index] || 'Partecipante'}`"
                  class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  v-if="form.members.length > 2"
                  @click="removeMember(index)"
                  class="text-gray-300 hover:text-red-400 px-2 transition"
                >✕</button>
              </div>
            </div>
            <button
              @click="addMember"
              class="mt-2 text-sm text-green-600 hover:text-green-800 font-medium"
            >
              + Aggiungi partecipante
            </button>
          </div>

          <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

          <button
            @click="createGroup"
            :disabled="loading"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg py-2.5 transition"
          >
            {{ loading ? 'Creazione...' : 'Crea gruppo →' }}
          </button>
        </div>
      </div>

      <!-- Recupera gruppo esistente -->
      <div class="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-1">Hai già un gruppo?</h2>
        <p class="text-sm text-gray-400 mb-3">Incolla il link che ti hanno condiviso.</p>
        <div class="flex gap-2">
          <input
            v-model="existingId"
            type="text"
            placeholder="Link o ID del gruppo"
            class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            @click="goToGroup"
            class="bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg px-4 py-2 text-sm transition"
          >
            Vai
          </button>
        </div>
        <p v-if="linkError" class="text-red-500 text-sm mt-2">{{ linkError }}</p>
      </div>

      <!-- Perché Equa -->
      <div class="grid grid-cols-3 gap-3 mb-8">
        <div class="bg-white rounded-xl shadow p-4 text-center">
          <div class="text-2xl mb-1">🔗</div>
          <p class="text-xs font-medium text-gray-700">Basta un link</p>
          <p class="text-xs text-gray-400 mt-1">Niente app, niente registrazione</p>
        </div>
        <div class="bg-white rounded-xl shadow p-4 text-center">
          <div class="text-2xl mb-1">⚖️</div>
          <p class="text-xs font-medium text-gray-700">Conti precisi</p>
          <p class="text-xs text-gray-400 mt-1">Algoritmo che minimizza i pagamenti</p>
        </div>
        <div class="bg-white rounded-xl shadow p-4 text-center">
          <div class="text-2xl mb-1">❤️</div>
          <p class="text-xs font-medium text-gray-700">Gratis per sempre</p>
          <p class="text-xs text-gray-400 mt-1">Nessun abbonamento, mai</p>
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

const router = useRouter()

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

function addMember() {
  form.members.push({ name: '' })
}

function removeMember(index: number) {
  form.members.splice(index, 1)
}

async function createGroup() {
  error.value = ''

  if (!form.name.trim()) {
    error.value = 'Dai un nome al gruppo.'
    return
  }

  const validMembers = form.members.filter(m => m.name.trim())
  if (validMembers.length < 2) {
    error.value = 'Aggiungi almeno 2 partecipanti.'
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
    router.push(`/group/${response.data.id}`)
  } catch {
    error.value = 'Qualcosa è andato storto. Riprova.'
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
    linkError.value = 'Link o ID non valido.'
  }
}
</script>