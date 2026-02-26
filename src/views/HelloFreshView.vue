<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-stone-800">🥗 Hello Fresh</h2>
        <p class="text-stone-500 text-sm mt-1">
          Distribution aléatoire — 600 plats (max 100/recette) · 1 200 boissons (max 600/recette)
        </p>
      </div>
      <button @click="generate" :disabled="loading" class="btn-primary text-base px-6 py-3">
        <span v-if="loading">⏳ Génération…</span>
        <span v-else>🎲 {{ generated ? 'Regénérer' : 'Générer le menu' }}</span>
      </button>
    </div>

    <!-- Stats (visible après génération) -->
    <Transition name="fade">
      <div v-if="generated" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="stat-card">
          <div class="text-2xl font-bold text-teal-700">600</div>
          <div class="text-xs text-stone-500 mt-0.5">plats</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-teal-700">1 200</div>
          <div class="text-xs text-stone-500 mt-0.5">boissons</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-teal-700">{{ shoppingList.length }}</div>
          <div class="text-xs text-stone-500 mt-0.5">ingrédients</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-emerald-600">{{ grandTotal.toLocaleString('fr') }}€</div>
          <div class="text-xs text-stone-500 mt-0.5">coût total</div>
        </div>
      </div>
    </Transition>

    <!-- Grille principale -->
    <div v-if="generated" class="grid lg:grid-cols-[1fr_280px_340px] gap-6 items-start">

      <!-- ── Plats ── -->
      <div class="card p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-stone-700">🍽️ Plats</h3>
          <span class="text-xs text-stone-400">
            {{ activePlatCount }} recettes servies · max 100/plat
          </span>
        </div>
        <div class="space-y-1 max-h-[600px] overflow-y-auto -mx-1 px-1">
          <div
            v-for="[name, qty] in sortedPlats"
            :key="name"
            class="flex items-center justify-between py-1.5 border-b border-stone-50 last:border-0 gap-2"
          >
            <span class="text-sm text-stone-700 truncate">{{ name }}</span>
            <span class="badge bg-teal-100 text-teal-700 shrink-0 tabular-nums">×{{ qty }}</span>
          </div>
        </div>
      </div>

      <!-- ── Boissons ── -->
      <div class="card p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-stone-700">🥤 Boissons</h3>
          <span class="text-xs text-stone-400">max 600/boisson</span>
        </div>
        <div class="space-y-3">
          <div v-for="[name, qty] in sortedBoissons" :key="name">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-stone-700 truncate mr-2">{{ name }}</span>
              <span class="badge bg-teal-100 text-teal-700 shrink-0 tabular-nums">×{{ qty }}</span>
            </div>
            <!-- Barre de progression vers le max 600 -->
            <div class="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-700"
                :style="{ width: `${(qty / 600) * 100}%` }"
              />
            </div>
            <div class="text-right text-xs text-stone-400 mt-0.5">
              {{ Math.round((qty / 600) * 100) }}% du max
            </div>
          </div>
        </div>
      </div>

      <!-- ── Liste de courses (sticky) ── -->
      <div class="lg:sticky lg:top-20 card p-5">
        <div class="flex items-center justify-between mb-1">
          <h3 class="font-bold text-stone-800">🛒 Liste de courses</h3>
          <span class="text-xs text-stone-400">{{ shoppingList.length }} articles</span>
        </div>
        <p class="text-xs text-stone-400 mb-4">Tous plats + boissons confondus</p>

        <div class="space-y-1 max-h-[55vh] overflow-y-auto -mx-1 px-1">
          <div
            v-for="item in shoppingList"
            :key="item.name"
            class="flex items-center justify-between py-2 border-b border-stone-50 last:border-0 gap-3"
          >
            <div class="min-w-0">
              <div class="text-sm text-stone-700 font-medium truncate">{{ item.name }}</div>
              <div class="text-xs text-stone-400">
                {{ item.count.toLocaleString('fr') }}×
                <span class="text-stone-300 mx-0.5">·</span>
                {{ item.unitPrice }}€/u
              </div>
            </div>
            <span class="font-semibold text-stone-700 shrink-0 tabular-nums">
              {{ item.total.toLocaleString('fr') }}€
            </span>
          </div>
        </div>

        <div class="pt-4 border-t-2 border-stone-100 mt-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-stone-800 text-lg">Total</span>
            <span class="text-2xl font-bold text-emerald-600 tabular-nums">
              {{ grandTotal.toLocaleString('fr') }}€
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!generated && !loading" class="flex flex-col items-center justify-center py-24 text-stone-400">
      <div class="text-7xl mb-5 select-none">🎲</div>
      <p class="text-lg font-semibold text-stone-600">Aucun menu généré</p>
      <p class="text-sm mt-2 text-center max-w-sm leading-relaxed">
        Génère une distribution aléatoire de 600 plats et 1 200 boissons
        avec la liste de courses complète.
      </p>
      <button @click="generate" class="btn-primary mt-8 text-base px-8 py-3">
        🎲 Générer le menu
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { recipes, getIngredientPrice } from '../data.js'

// ── Constantes ──────────────────────────────────────────────────────────────
const TOTAL_PLATS = 600
const TOTAL_BOISSONS = 1200
const MAX_PER_PLAT = 100
const MAX_PER_BOISSON = 600

const DRINK_NAMES = new Set([
  'Chocolat Chaud',
  '3x Limonades',
  'Milkshake chocolat',
  'Milkshake fraise',
  '3x Smoothie aux fruits',
])

const platRecipes = recipes.filter(r => !DRINK_NAMES.has(r.name))
const boissonRecipes = recipes.filter(r => DRINK_NAMES.has(r.name))

// ── État ─────────────────────────────────────────────────────────────────────
const platCounts = ref(new Map())
const boissonCounts = ref(new Map())
const generated = ref(false)
const loading = ref(false)

// ── Algorithme de distribution ───────────────────────────────────────────────
// Distribue `total` unités parmi `recipeList` avec un max de `maxPerRecipe`
// Garantit que la somme est EXACTEMENT égale à `total`.
function distribute(recipeList, total, maxPerRecipe) {
  const n = recipeList.length

  // Pondération aléatoire (distribution gamma-like via -log(U))
  const weights = Array.from({ length: n }, () => -Math.log(Math.random() + 1e-10))
  const sumW = weights.reduce((a, b) => a + b, 0)

  // Allocation initiale proportionnelle, plafonnée
  const counts = weights.map(w => Math.min(maxPerRecipe, Math.round((w / sumW) * total)))

  // Ajustement pour atteindre exactement `total`
  let delta = total - counts.reduce((a, b) => a + b, 0)
  let guard = 0

  while (delta !== 0 && guard < 50_000) {
    guard++
    const i = Math.floor(Math.random() * n)
    if (delta > 0 && counts[i] < maxPerRecipe) {
      counts[i]++
      delta--
    } else if (delta < 0 && counts[i] > 0) {
      counts[i]--
      delta++
    }
  }

  const result = new Map()
  recipeList.forEach((r, i) => result.set(r.name, counts[i]))
  return result
}

// ── Génération ───────────────────────────────────────────────────────────────
async function generate() {
  loading.value = true
  // Micro-délai pour que le spinner s'affiche avant le calcul synchrone
  await new Promise(r => setTimeout(r, 250))
  platCounts.value = distribute(platRecipes, TOTAL_PLATS, MAX_PER_PLAT)
  boissonCounts.value = distribute(boissonRecipes, TOTAL_BOISSONS, MAX_PER_BOISSON)
  generated.value = true
  loading.value = false
}

// ── Computed ─────────────────────────────────────────────────────────────────
const sortedPlats = computed(() =>
  [...platCounts.value.entries()]
    .filter(([, qty]) => qty > 0)
    .sort((a, b) => b[1] - a[1])
)

const sortedBoissons = computed(() =>
  [...boissonCounts.value.entries()].sort((a, b) => b[1] - a[1])
)

const activePlatCount = computed(() =>
  [...platCounts.value.values()].filter(q => q > 0).length
)

const shoppingList = computed(() => {
  const map = new Map()

  const addIngredients = (recipe, qty) => {
    for (const ingName of recipe.ingredients) {
      const unitPrice = getIngredientPrice(ingName)
      if (map.has(ingName)) {
        const e = map.get(ingName)
        e.count += qty
        e.total += unitPrice * qty
      } else {
        map.set(ingName, { name: ingName, count: qty, unitPrice, total: unitPrice * qty })
      }
    }
  }

  for (const recipe of platRecipes) {
    const qty = platCounts.value.get(recipe.name) ?? 0
    if (qty > 0) addIngredients(recipe, qty)
  }
  for (const recipe of boissonRecipes) {
    const qty = boissonCounts.value.get(recipe.name) ?? 0
    if (qty > 0) addIngredients(recipe, qty)
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
})

const grandTotal = computed(() =>
  shoppingList.value.reduce((s, i) => s + i.total, 0)
)
</script>
