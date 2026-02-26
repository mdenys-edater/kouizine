<template>
  <div class="min-h-screen bg-gradient-to-br from-teal-900 via-teal-700 to-emerald-500 flex items-center justify-center p-4">
    <!-- Card -->
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-br from-teal-800 to-emerald-600 px-8 py-8 text-center">
        <div class="text-5xl mb-3 select-none">🫕☠️</div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Echo - Kouizine</h1>
        <p class="text-teal-200 text-sm mt-1">Livre de recettes</p>
        <p class="text-teal-200 text-sm mt-1">(Peut aussi servir à empoisonner Billy)</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="px-8 py-7 space-y-4">
        <!-- Username -->
        <div>
          <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
            Identifiant
          </label>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            placeholder="Entrez votre identifiant"
            class="input w-full"
            :class="{ 'border-red-300 focus:ring-red-300': error }"
            @input="error = ''"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
            Mot de passe
          </label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPwd ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Entrez votre mot de passe"
              class="input w-full pr-10"
              :class="{ 'border-red-300 focus:ring-red-300': error }"
              @input="error = ''"
            />
            <button
              type="button"
              @click="showPwd = !showPwd"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors text-sm select-none"
              tabindex="-1"
            >
              {{ showPwd ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <!-- Error -->
        <Transition name="err">
          <div
            v-if="error"
            class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{{ error }}</span>
          </div>
        </Transition>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          class="btn-primary w-full justify-center py-2.5 text-base mt-2"
          :class="{ 'opacity-70 cursor-not-allowed': loading }"
        >
          <span v-if="loading">⏳ Connexion…</span>
          <span v-else>Se connecter</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../auth.js'

const router = useRouter()

const username = ref('')
const password = ref('')
const showPwd = ref(false)
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = 'Veuillez remplir tous les champs.'
    return
  }

  loading.value = true
  // petit délai pour l'effet visuel
  await new Promise(r => setTimeout(r, 400))

  const ok = login(username.value, password.value)
  loading.value = false

  if (ok) {
    router.push('/recettes')
  } else {
    error.value = 'Identifiant ou mot de passe incorrect.'
    password.value = ''
  }
}
</script>

<style scoped>
.err-enter-active,
.err-leave-active {
  transition: all 0.2s ease;
}
.err-enter-from,
.err-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
