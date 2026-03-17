<template>
  <div class="min-h-screen">
    <!-- Header (masqué sur la page de login) -->
    <header
      v-if="isAuthenticated"
      class="no-print bg-gradient-to-r from-teal-900 via-teal-700 to-emerald-600 text-white shadow-lg sticky top-0 z-40"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl select-none">🫕☠️</span>
          <div>
            <h1 class="text-xl font-bold tracking-tight leading-none">Kouizine</h1>
            <p class="text-teal-200 text-xs mt-0.5">Livre de recettes (Peut aussi servir à empoisonner Billy)</p>
          </div>
        </div>

        <nav class="flex items-center gap-1">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-teal-100 hover:bg-white/10 hover:text-white transition-all duration-150"
            active-class="!bg-white/20 !text-white"
          >
            <span>{{ link.icon }}</span>
            <span class="hidden sm:inline">{{ link.label }}</span>
          </RouterLink>
        </nav>

        <div class="flex items-center gap-1">
          <!-- Dark mode toggle -->
          <button
            @click="toggleDark"
            class="px-3 py-2 rounded-lg text-teal-200 hover:bg-white/10 hover:text-white transition-all duration-150 text-base"
            :title="isDark ? 'Mode clair' : 'Mode sombre'"
          >
            {{ isDark ? '☀️' : '🌙' }}
          </button>
          <!-- Logout -->
          <button
            @click="handleLogout"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-teal-200 hover:bg-white/10 hover:text-white transition-all duration-150"
            title="Se déconnecter"
          >
            <span>🚪</span>
            <span class="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main :class="isAuthenticated ? 'max-w-7xl mx-auto px-4 sm:px-6 py-6' : ''">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { isAuthenticated, logout } from './auth.js'

const router = useRouter()

const isDark = ref(false)

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function toggleDark() {
  isDark.value = !isDark.value
  applyTheme()
}

onMounted(() => {
  isDark.value = localStorage.getItem('theme') === 'dark'
  applyTheme()
})

const navLinks = [
  { to: '/recettes', icon: '📋', label: 'Recettes' },
  { to: '/menu', icon: '📑', label: 'Menu' },
  { to: '/ingredients', icon: '🥬', label: 'Ingrédients' },
  { to: '/hello-fresh', icon: '🥗', label: 'Echo Fresh' },
  { to: '/echo-frigo', icon: '🧊', label: 'Echo-frigo' },
  { to: '/menu-image', icon: '🖼️', label: 'Affiche' },
]

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
