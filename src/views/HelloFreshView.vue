<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-stone-800 dark:text-stone-100">🥗 Echo Fresh</h2>
        <p class="text-stone-500 dark:text-stone-400 text-sm mt-1">
          8 plats × 60 portions · 2 desserts × 40 portions · liste de courses complète
        </p>
      </div>
      <button @click="generate" :disabled="loading" class="btn-primary text-base px-6 py-3">
        <span v-if="loading">⏳ Génération…</span>
        <span v-else>🎲 {{ generated ? 'Regénérer' : 'Générer le menu' }}</span>
      </button>
    </div>

    <!-- Stats -->
    <Transition name="fade">
      <div v-if="generated" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="stat-card">
          <div class="text-2xl font-bold text-teal-700 dark:text-teal-400">480</div>
          <div class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">portions plats</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-teal-700 dark:text-teal-400">80</div>
          <div class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">portions desserts</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-teal-700 dark:text-teal-400">{{ toBuyList.length }}</div>
          <div class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">à acheter</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ grandTotal.toLocaleString('fr') }}€</div>
          <div class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">coût total</div>
        </div>
      </div>
    </Transition>

    <!-- Grille principale -->
    <div v-if="generated" class="grid lg:grid-cols-[1fr_1fr_360px] gap-6 items-start">

      <!-- ── Plats ── -->
      <div class="card p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-stone-700 dark:text-stone-200">🍽️ Plats</h3>
          <span class="text-xs text-stone-400">8 recettes × 60 portions</span>
        </div>
        <div class="space-y-1.5">
          <div
            v-for="recipe in selectedPlats"
            :key="recipe.name"
            class="flex items-center justify-between py-2 border-b border-stone-50 dark:border-stone-800 last:border-0 gap-2"
          >
            <div class="min-w-0">
              <div class="text-sm text-stone-700 dark:text-stone-200">{{ recipe.name }}</div>
              <div class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="ing in recipe.ingredients"
                  :key="ing"
                  :class="fishIngredients.has(ing)
                    ? 'badge bg-blue-50 text-blue-600 text-xs dark:bg-blue-900/40 dark:text-blue-300'
                    : 'badge bg-stone-100 text-stone-400 text-xs dark:bg-stone-800 dark:text-stone-400'"
                >
                  <span v-if="fishIngredients.has(ing)">🎣 </span>{{ ing }}
                </span>
              </div>
            </div>
            <span class="badge bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 shrink-0 tabular-nums ml-2">×60</span>
          </div>
        </div>
      </div>

      <!-- ── Desserts ── -->
      <div class="card p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-stone-700 dark:text-stone-200">🍰 Desserts</h3>
          <span class="text-xs text-stone-400">2 recettes × 40 portions</span>
        </div>
        <div class="space-y-1.5">
          <div
            v-for="recipe in selectedDesserts"
            :key="recipe.name"
            class="flex items-center justify-between py-2 border-b border-stone-50 dark:border-stone-800 last:border-0 gap-2"
          >
            <div class="min-w-0">
              <div class="text-sm text-stone-700 dark:text-stone-200">{{ recipe.name }}</div>
              <div class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="ing in recipe.ingredients"
                  :key="ing"
                  :class="fishIngredients.has(ing)
                    ? 'badge bg-blue-50 text-blue-600 text-xs dark:bg-blue-900/40 dark:text-blue-300'
                    : 'badge bg-stone-100 text-stone-400 text-xs dark:bg-stone-800 dark:text-stone-400'"
                >
                  <span v-if="fishIngredients.has(ing)">🎣 </span>{{ ing }}
                </span>
              </div>
            </div>
            <span class="badge bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 shrink-0 tabular-nums ml-2">×40</span>
          </div>
        </div>
      </div>

      <!-- ── Liste de courses (sticky) ── -->
      <div class="lg:sticky lg:top-20 card p-5">
        <h3 class="font-bold text-stone-800 dark:text-stone-100 mb-4">🛒 Liste de courses</h3>

        <!-- À acheter -->
        <p class="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
          À acheter · {{ toBuyList.length }} articles
        </p>
        <div class="space-y-1 max-h-[30vh] overflow-y-auto -mx-1 px-1 mb-4">
          <div
            v-for="item in toBuyList"
            :key="item.name"
            class="flex items-center justify-between py-2 border-b border-stone-50 dark:border-stone-800 last:border-0 gap-3"
          >
            <div class="min-w-0">
              <div class="text-sm text-stone-700 dark:text-stone-200 font-medium truncate">{{ item.name }}</div>
              <div class="text-xs text-stone-400">
                {{ item.count.toLocaleString('fr') }}×
                <span class="text-stone-300 dark:text-stone-600 mx-0.5">·</span>
                {{ item.unitPrice }}€/u
              </div>
            </div>
            <span class="font-semibold text-stone-700 dark:text-stone-200 shrink-0 tabular-nums">
              {{ item.total.toLocaleString('fr') }}€
            </span>
          </div>
        </div>

        <!-- À pêcher -->
        <p class="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
          🎣 À pêcher · {{ toFishList.length }} articles
        </p>
        <div class="space-y-1 max-h-[20vh] overflow-y-auto -mx-1 px-1 mb-4">
          <div
            v-for="item in toFishList"
            :key="item.name"
            class="flex items-center justify-between py-1.5 border-b border-stone-50 dark:border-stone-800 last:border-0 gap-3"
          >
            <div class="text-sm text-stone-600 dark:text-stone-300 font-medium truncate">{{ item.name }}</div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs text-stone-400 tabular-nums">{{ item.count.toLocaleString('fr') }}×</span>
              <span class="text-xs text-blue-500 font-medium">Gratuit</span>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t-2 border-stone-100 dark:border-stone-700">
          <div class="flex items-center justify-between">
            <span class="font-bold text-stone-800 dark:text-stone-100 text-lg">Total achats</span>
            <span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {{ grandTotal.toLocaleString('fr') }}€
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!generated && !loading" class="flex flex-col items-center justify-center py-24 text-stone-400">
      <div class="text-7xl mb-5 select-none">🎲</div>
      <p class="text-lg font-semibold text-stone-600 dark:text-stone-300">Aucun menu généré</p>
      <p class="text-sm mt-2 text-center max-w-sm leading-relaxed">
        Génère 8 plats aléatoires et 2 desserts avec la liste de courses complète.
      </p>
      <button @click="generate" class="btn-primary mt-8 text-base px-8 py-3">
        🎲 Générer le menu
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { recipes, getIngredientPrice, fishIngredients } from '../data.js'

// ── Catégories ───────────────────────────────────────────────────────────────
const DESSERT_NAMES = new Set([
  'Cookies',
  'Crepe',
  'Dango Fruite',
  "Donut's fraise",
  'Fleur aux pommes',
  'Fondant chocolat',
  "Gateau d'anniversaire",
  "Gateau de semoule a l'orange",
  'Gauffre Nature',
  'Gauffre au sucre',
  '3x Macarons',
  'Mochi Fraise-Chocolat',
  'Mousse au Chocolat',
  'Muffins au chocolat',
  'Pain perdu',
  'Riz au lait',
  'Salade de fruit',
  'Tarte au pomme',
  'Tartelette citron',
  'Tartelette fraise',
  'Tartine de confiture de fraise',
])

const DRINK_NAMES = new Set([
  'Chocolat Chaud',
  '3x Limonades',
  'Milkshake chocolat',
  'Milkshake fraise',
  '3x Smoothie aux fruits',
])

const platRecipes = recipes.filter(r => !DESSERT_NAMES.has(r.name) && !DRINK_NAMES.has(r.name))
const dessertRecipes = recipes.filter(r => DESSERT_NAMES.has(r.name))

// ── État ─────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'echoFreshMenu'

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const saved = loadSaved()
const selectedPlats = ref(saved ? recipes.filter(r => saved.plats.includes(r.name)) : [])
const selectedDesserts = ref(saved ? recipes.filter(r => saved.desserts.includes(r.name)) : [])
const generated = ref(!!saved)
const loading = ref(false)

// ── Génération ───────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function generate() {
  loading.value = true
  await new Promise(r => setTimeout(r, 150))
  selectedPlats.value = shuffle(platRecipes).slice(0, 8)
  selectedDesserts.value = shuffle(dessertRecipes).slice(0, 2)
  generated.value = true
  loading.value = false
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    plats: selectedPlats.value.map(r => r.name),
    desserts: selectedDesserts.value.map(r => r.name),
  }))
}

// ── Liste de courses ──────────────────────────────────────────────────────────
const allIngredients = computed(() => {
  const map = new Map()

  const addIngredients = (recipe, qty) => {
    for (const ingName of recipe.ingredients) {
      const unitPrice = getIngredientPrice(ingName)
      const isFish = fishIngredients.has(ingName)
      if (map.has(ingName)) {
        const e = map.get(ingName)
        e.count += qty
        if (!isFish) e.total += unitPrice * qty
      } else {
        map.set(ingName, {
          name: ingName,
          count: qty,
          unitPrice,
          total: isFish ? 0 : unitPrice * qty,
          isFish,
        })
      }
    }
  }

  for (const recipe of selectedPlats.value) addIngredients(recipe, 60)
  for (const recipe of selectedDesserts.value) addIngredients(recipe, 40)

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
})

const toBuyList = computed(() => allIngredients.value.filter(i => !i.isFish))
const toFishList = computed(() => allIngredients.value.filter(i => i.isFish))

const grandTotal = computed(() =>
  toBuyList.value.reduce((s, i) => s + i.total, 0)
)
</script>
