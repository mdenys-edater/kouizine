<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-stone-800 dark:text-stone-100">🎣 Pêche Mignon</h2>
      <p class="text-stone-500 dark:text-stone-400 text-sm mt-1">
        Renseignez votre prise du jour pour obtenir les recettes et la liste de courses
      </p>
    </div>

    <div class="grid lg:grid-cols-[260px_1fr_300px] gap-6 items-start">

      <!-- ── Panier de pêche (sticky) ── -->
      <div class="lg:sticky lg:top-20 card p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-stone-700 dark:text-stone-200">🧺 Ma prise</h3>
          <button
            v-if="hasCatch"
            @click="clearCatch"
            class="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Tout vider
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="fish in fishList"
            :key="fish"
            class="flex items-center gap-2"
          >
            <span class="text-lg w-7 text-center select-none shrink-0">{{ fishEmoji(fish) }}</span>
            <span
              :class="[
                'flex-1 text-sm truncate transition-colors',
                qty(fish) > 0
                  ? 'text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-stone-500 dark:text-stone-400',
              ]"
            >{{ fish }}</span>
            <div class="flex items-center gap-1 shrink-0">
              <button
                @click="decrement(fish)"
                :disabled="qty(fish) === 0"
                class="w-7 h-7 rounded-lg text-sm font-bold transition-colors disabled:opacity-25
                       bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700
                       text-stone-600 dark:text-stone-300 disabled:cursor-not-allowed"
              >−</button>
              <span
                :class="[
                  'w-7 text-center tabular-nums text-sm font-semibold',
                  qty(fish) > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-stone-300 dark:text-stone-600',
                ]"
              >{{ qty(fish) }}</span>
              <button
                @click="increment(fish)"
                class="w-7 h-7 rounded-lg text-sm font-bold transition-colors
                       bg-teal-100 dark:bg-teal-900/50 hover:bg-teal-200 dark:hover:bg-teal-800
                       text-teal-700 dark:text-teal-300"
              >+</button>
            </div>
          </div>
        </div>

        <div v-if="hasCatch" class="mt-4 pt-3 border-t border-stone-100 dark:border-stone-700 space-y-1">
          <div
            v-for="fish in fishList.filter(f => qty(f) > 0)"
            :key="fish"
            class="flex items-center justify-between text-xs"
          >
            <span class="text-stone-500 dark:text-stone-400">{{ fishEmoji(fish) }} {{ fish }}</span>
            <span class="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">×{{ qty(fish) }}</span>
          </div>
        </div>
      </div>

      <!-- ── Recettes ── -->
      <div>
        <!-- Filtres -->
        <div v-if="hasCatch" class="flex flex-wrap gap-2 mb-4">
          <button @click="filter = 'all'" :class="tabClass('all')">
            Toutes ({{ scoredRecipes.length }})
          </button>
          <button @click="filter = 'ready'" :class="tabClass('ready')">
            ✓ Prêtes ({{ readyCount }})
          </button>
          <button @click="filter = 'almost'" :class="tabClass('almost')">
            Presque ({{ almostCount }})
          </button>
        </div>

        <!-- Empty state : rien pêché -->
        <div v-if="!hasCatch" class="flex flex-col items-center justify-center py-24 text-stone-400">
          <div class="text-7xl mb-5 select-none">🎣</div>
          <p class="text-lg font-semibold text-stone-600 dark:text-stone-300">Filets vides</p>
          <p class="text-sm mt-2 text-center max-w-sm leading-relaxed">
            Renseignez les quantités pêchées pour voir les recettes et la liste de courses.
          </p>
        </div>

        <!-- Empty state : aucun résultat -->
        <div v-else-if="filteredRecipes.length === 0" class="flex flex-col items-center justify-center py-24 text-stone-400">
          <div class="text-7xl mb-5 select-none">🐟</div>
          <p class="text-lg font-semibold text-stone-600 dark:text-stone-300">Aucune recette</p>
          <p class="text-sm mt-2">Essayez un autre filtre.</p>
        </div>

        <!-- Grille de recettes -->
        <div v-else class="grid sm:grid-cols-2 gap-3">
          <div
            v-for="item in filteredRecipes"
            :key="item.recipe.name"
            @click="toggleSelected(item.recipe.name)"
            :class="[
              'card p-4 flex flex-col gap-3 cursor-pointer transition-all duration-150',
              selected.has(item.recipe.name)
                ? 'ring-2 ring-teal-500 dark:ring-teal-400 shadow-md'
                : 'hover:shadow-md',
            ]"
          >
            <!-- Nom + portions -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span
                  :class="[
                    'shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors text-xs',
                    selected.has(item.recipe.name)
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : 'border-stone-300 dark:border-stone-600',
                  ]"
                >{{ selected.has(item.recipe.name) ? '✓' : '' }}</span>
                <h4 class="font-semibold text-stone-800 dark:text-stone-100 text-sm leading-tight">
                  {{ item.recipe.name }}
                </h4>
              </div>
              <span
                :class="[
                  'badge shrink-0 font-semibold tabular-nums',
                  item.maxServings > 0 && item.missingFish.length === 0
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
                ]"
              >
                {{ item.maxServings > 0 ? `×${item.maxServings}` : '×0' }}
              </span>
            </div>

            <!-- Ingrédients colorés -->
            <div class="flex flex-wrap gap-1">
              <span
                v-for="ing in item.recipe.ingredients"
                :key="ing"
                :class="[
                  'badge text-xs',
                  qty(ing) > 0
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                    : fishIngredients.has(ing)
                      ? 'bg-red-50 text-red-500 line-through dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-400',
                ]"
              >
                <span v-if="fishIngredients.has(ing)" class="mr-0.5">🎣</span>{{ ing }}
              </span>
            </div>

            <!-- Pied de carte -->
            <div class="pt-2 border-t border-stone-100 dark:border-stone-700 mt-auto text-xs">
              <div v-if="item.missingFish.length === 0 && item.maxServings > 0">
                <span class="text-emerald-600 dark:text-emerald-400 font-medium">✓ Prête</span>
                <span class="text-stone-400 ml-1.5">— acheter {{ item.missingBuy.map(m => m.name).join(', ') || 'rien' }}</span>
              </div>
              <div v-else-if="item.missingFish.length">
                <span class="text-blue-400">🎣 Manque :</span>
                <span class="text-stone-500 dark:text-stone-400 ml-1">{{ item.missingFish.join(', ') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Liste de courses (sticky) ── -->
      <div v-if="hasCatch && shoppingList.length > 0" class="lg:sticky lg:top-20 card p-5">
        <h3 class="font-bold text-stone-800 dark:text-stone-100 mb-1">🛒 Liste de courses</h3>
        <p class="text-xs text-stone-400 mb-4">
          {{ selected.size > 0 ? `${selected.size} recette${selected.size > 1 ? 's' : ''} sélectionnée${selected.size > 1 ? 's' : ''}` : 'Toutes les recettes prêtes' }}
        </p>

        <div class="space-y-1 max-h-[55vh] overflow-y-auto -mx-1 px-1 mb-4">
          <div
            v-for="item in shoppingList"
            :key="item.name"
            class="flex items-center justify-between py-2 border-b border-stone-50 dark:border-stone-800 last:border-0 gap-3"
          >
            <div class="min-w-0">
              <div class="text-sm text-stone-700 dark:text-stone-200 font-medium truncate">{{ item.name }}</div>
              <div class="text-xs text-stone-400">
                {{ item.count }}×
                <span class="text-stone-300 dark:text-stone-600 mx-0.5">·</span>
                {{ item.unitPrice }}€/u
              </div>
            </div>
            <span class="font-semibold text-stone-700 dark:text-stone-200 shrink-0 tabular-nums">
              {{ item.total }}€
            </span>
          </div>
        </div>

        <div class="pt-3 border-t-2 border-stone-100 dark:border-stone-700 flex items-center justify-between">
          <span class="font-bold text-stone-800 dark:text-stone-100">Total</span>
          <span class="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {{ grandTotal }}€
          </span>
        </div>
      </div>

      <!-- Placeholder liste si pas de recettes prêtes -->
      <div v-else-if="hasCatch" class="lg:sticky lg:top-20 card p-5 flex flex-col items-center justify-center py-12 text-stone-400">
        <div class="text-4xl mb-3 select-none">🛒</div>
        <p class="text-sm text-center">Aucune recette complète<br>pour l'instant</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { recipes, fishIngredients, getIngredientPrice } from '../data.js'

const fishList = [...fishIngredients].sort((a, b) => a.localeCompare(b, 'fr'))

const EMOJI_MAP = {
  Calamar: '🦑',
  Crabe: '🦀',
  Crevette: '🦐',
  Homard: '🦞',
  Moule: '🦪',
  Saumon: '🐟',
  Thon: '🐡',
  Truite: '🎣',
}
function fishEmoji(name) {
  return EMOJI_MAP[name] ?? '🐟'
}

// Map fish → quantity
const catchQty = ref(new Map())
const filter = ref('all')
const selected = ref(new Set())

const hasCatch = computed(() => [...catchQty.value.values()].some(q => q > 0))

function qty(name) {
  return catchQty.value.get(name) ?? 0
}

function increment(name) {
  const next = new Map(catchQty.value)
  next.set(name, (next.get(name) ?? 0) + 1)
  catchQty.value = next
}

function decrement(name) {
  const next = new Map(catchQty.value)
  const cur = next.get(name) ?? 0
  if (cur > 0) next.set(name, cur - 1)
  catchQty.value = next
}

function clearCatch() {
  catchQty.value = new Map()
  selected.value = new Set()
}

function toggleSelected(name) {
  const next = new Set(selected.value)
  next.has(name) ? next.delete(name) : next.add(name)
  selected.value = next
}

// Nombre max de portions d'une recette basé sur les quantités de poisson disponibles
function maxServingsFor(recipe) {
  const fishNeeded = recipe.ingredients.filter(ing => fishIngredients.has(ing))
  if (fishNeeded.length === 0) return 0
  // Limité par le poisson le moins disponible
  return Math.min(...fishNeeded.map(ing => qty(ing)))
}

const scoredRecipes = computed(() => {
  return recipes
    .filter(r => r.ingredients.some(ing => fishIngredients.has(ing) && qty(ing) > 0))
    .map(recipe => {
      const fishInRecipe = recipe.ingredients.filter(ing => fishIngredients.has(ing))
      const fishUsed = fishInRecipe.filter(ing => qty(ing) > 0).length
      const missingFish = fishInRecipe.filter(ing => qty(ing) === 0)
      const missingBuy = recipe.ingredients
        .filter(ing => !fishIngredients.has(ing))
        .map(ing => ({ name: ing, price: getIngredientPrice(ing) }))
      const maxServings = maxServingsFor(recipe)

      return {
        recipe,
        fishUsed,
        totalFish: fishInRecipe.length,
        missingFish,
        missingBuy,
        maxServings,
      }
    })
    .sort((a, b) =>
      a.missingFish.length - b.missingFish.length ||
      b.maxServings - a.maxServings ||
      a.missingBuy.length - b.missingBuy.length
    )
})

const readyCount = computed(() => scoredRecipes.value.filter(i => i.missingFish.length === 0).length)
const almostCount = computed(() =>
  scoredRecipes.value.filter(i => i.missingFish.length >= 1 && i.missingFish.length <= 1).length
)

const filteredRecipes = computed(() => {
  if (filter.value === 'ready') return scoredRecipes.value.filter(i => i.missingFish.length === 0)
  if (filter.value === 'almost') return scoredRecipes.value.filter(i => i.missingFish.length === 1)
  return scoredRecipes.value
})

// Liste de courses : recettes sélectionnées, ou toutes les prêtes si aucune sélection
const shoppingList = computed(() => {
  const map = new Map()
  for (const item of scoredRecipes.value) {
    if (item.missingFish.length > 0 || item.maxServings === 0) continue
    if (selected.value.size > 0 && !selected.value.has(item.recipe.name)) continue
    for (const { name, price } of item.missingBuy) {
      const count = item.maxServings
      if (map.has(name)) {
        const e = map.get(name)
        e.count += count
        e.total += price * count
      } else {
        map.set(name, { name, count, unitPrice: price, total: price * count })
      }
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
})

const grandTotal = computed(() => shoppingList.value.reduce((s, i) => s + i.total, 0))

function tabClass(f) {
  return filter.value === f
    ? 'btn-primary text-sm px-3 py-1.5'
    : 'text-sm px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors'
}
</script>
