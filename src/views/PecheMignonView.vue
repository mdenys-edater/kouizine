<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-stone-800 dark:text-stone-100">🎣 Pêche Mignon</h2>
      <p class="text-stone-500 dark:text-stone-400 text-sm mt-1">
        Sélectionnez votre prise du jour et trouvez les recettes les plus rentables
      </p>
    </div>

    <div class="grid lg:grid-cols-[280px_1fr] gap-6 items-start">

      <!-- ── Panier de pêche (sticky) ── -->
      <div class="lg:sticky lg:top-20 card p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-stone-700 dark:text-stone-200">🧺 Ma prise</h3>
          <button
            v-if="catch_.size"
            @click="clearCatch"
            class="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Tout vider
          </button>
        </div>

        <div class="space-y-1.5">
          <button
            v-for="fish in fishList"
            :key="fish"
            @click="toggleCatch(fish)"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 border',
              catch_.has(fish)
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 font-medium shadow-sm'
                : 'border-transparent hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300',
            ]"
          >
            <span class="text-lg">{{ fishEmoji(fish) }}</span>
            <span class="flex-1 text-left">{{ fish }}</span>
            <span v-if="catch_.has(fish)" class="text-blue-400 dark:text-blue-300 text-xs">✓</span>
          </button>
        </div>

        <div v-if="catch_.size" class="mt-4 pt-3 border-t border-stone-100 dark:border-stone-700">
          <p class="text-xs text-stone-400 mb-2">
            {{ catch_.size }} espèce{{ catch_.size > 1 ? 's' : '' }} pêchée{{ catch_.size > 1 ? 's' : '' }}
          </p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="fish in catch_"
              :key="fish"
              class="badge bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs"
            >
              {{ fishEmoji(fish) }} {{ fish }}
            </span>
          </div>
        </div>
      </div>

      <!-- ── Recettes ── -->
      <div>

        <!-- Filtres -->
        <div v-if="catch_.size" class="flex flex-wrap gap-2 mb-4">
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
        <div v-if="!catch_.size" class="flex flex-col items-center justify-center py-24 text-stone-400">
          <div class="text-7xl mb-5 select-none">🎣</div>
          <p class="text-lg font-semibold text-stone-600 dark:text-stone-300">Filets vides</p>
          <p class="text-sm mt-2 text-center max-w-sm leading-relaxed">
            Sélectionnez ce que vous avez pêché pour voir les recettes réalisables.
          </p>
        </div>

        <!-- Empty state : aucun résultat -->
        <div v-else-if="filteredRecipes.length === 0" class="flex flex-col items-center justify-center py-24 text-stone-400">
          <div class="text-7xl mb-5 select-none">🐟</div>
          <p class="text-lg font-semibold text-stone-600 dark:text-stone-300">Aucune recette</p>
          <p class="text-sm mt-2">Essayez un autre filtre.</p>
        </div>

        <!-- Grille de recettes -->
        <div v-else class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <div
            v-for="item in filteredRecipes"
            :key="item.recipe.name"
            class="card p-4 flex flex-col gap-3"
          >
            <!-- Nom + score -->
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-semibold text-stone-800 dark:text-stone-100 text-sm leading-tight">
                {{ item.recipe.name }}
              </h4>
              <span
                :class="[
                  'badge shrink-0 font-semibold',
                  item.missingAll.length === 0
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
                ]"
              >
                {{ item.fishUsed }}/{{ item.totalFish }} 🎣
              </span>
            </div>

            <!-- Ingrédients -->
            <div class="flex flex-wrap gap-1">
              <span
                v-for="ing in item.recipe.ingredients"
                :key="ing"
                :class="[
                  'badge text-xs',
                  catch_.has(ing)
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
            <div class="pt-2 border-t border-stone-100 dark:border-stone-700 mt-auto">
              <div v-if="item.missingAll.length === 0" class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Tout disponible !
              </div>
              <div v-else>
                <!-- Poissons manquants -->
                <div v-if="item.missingFish.length" class="mb-2">
                  <p class="text-xs text-blue-400 dark:text-blue-500 mb-1">🎣 À pêcher aussi</p>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="f in item.missingFish"
                      :key="f"
                      class="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full"
                    >
                      {{ f }}
                    </span>
                  </div>
                </div>
                <!-- Ingrédients à acheter -->
                <div v-if="item.missingBuy.length">
                  <p class="text-xs text-stone-400 mb-1">🛒 À acheter</p>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="m in item.missingBuy"
                      :key="m.name"
                      class="text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded-full"
                    >
                      {{ m.name }}&nbsp;<span class="text-stone-400">{{ m.price }}€</span>
                    </span>
                  </div>
                  <p class="text-right text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1.5">
                    +{{ item.buyCost }}€
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { recipes, ingredients, fishIngredients, getIngredientPrice } from '../data.js'

// Liste ordonnée des poissons disponibles
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

const catch_ = ref(new Set())
const filter = ref('all')

function toggleCatch(name) {
  const next = new Set(catch_.value)
  next.has(name) ? next.delete(name) : next.add(name)
  catch_.value = next
}

function clearCatch() {
  catch_.value = new Set()
}

// Recettes qui utilisent au moins un poisson de la prise
const scoredRecipes = computed(() => {
  return recipes
    .filter(r => r.ingredients.some(ing => catch_.value.has(ing)))
    .map(recipe => {
      const fishInRecipe = recipe.ingredients.filter(ing => fishIngredients.has(ing))
      const fishUsed = fishInRecipe.filter(ing => catch_.value.has(ing)).length
      const missingFish = fishInRecipe.filter(ing => !catch_.value.has(ing))
      const missingBuy = recipe.ingredients
        .filter(ing => !fishIngredients.has(ing))
        .map(ing => ({ name: ing, price: getIngredientPrice(ing) }))
      const missingAll = [...missingFish, ...missingBuy.map(m => m.name)]
      const buyCost = missingBuy.reduce((s, m) => s + m.price, 0)

      return {
        recipe,
        fishUsed,
        totalFish: fishInRecipe.length,
        missingFish,
        missingBuy,
        missingAll,
        buyCost,
      }
    })
    // Optimisation : d'abord les recettes les plus complètes en poisson,
    // ensuite par coût d'achat croissant
    .sort((a, b) =>
      b.fishUsed - a.fishUsed ||
      a.missingFish.length - b.missingFish.length ||
      a.buyCost - b.buyCost
    )
})

const readyCount = computed(() => scoredRecipes.value.filter(i => i.missingAll.length === 0).length)
const almostCount = computed(() =>
  scoredRecipes.value.filter(i => i.missingAll.length >= 1 && i.missingAll.length <= 2).length
)

const filteredRecipes = computed(() => {
  if (filter.value === 'ready') return scoredRecipes.value.filter(i => i.missingAll.length === 0)
  if (filter.value === 'almost') return scoredRecipes.value.filter(i => i.missingAll.length >= 1 && i.missingAll.length <= 2)
  return scoredRecipes.value
})

function tabClass(f) {
  return filter.value === f
    ? 'btn-primary text-sm px-3 py-1.5'
    : 'text-sm px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors'
}
</script>
