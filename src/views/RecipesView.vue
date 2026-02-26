<template>
  <div>
    <!-- Stats row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div class="stat-card">
        <div class="text-2xl font-bold text-amber-700">{{ recipes.length }}</div>
        <div class="text-xs text-stone-500 mt-0.5">recettes</div>
      </div>
      <div class="stat-card">
        <div class="text-2xl font-bold text-emerald-600">{{ minPrice }}€</div>
        <div class="text-xs text-stone-500 mt-0.5">moins chère</div>
      </div>
      <div class="stat-card">
        <div class="text-2xl font-bold text-amber-700">{{ avgPrice }}€</div>
        <div class="text-xs text-stone-500 mt-0.5">prix moyen</div>
      </div>
      <div class="stat-card">
        <div class="text-2xl font-bold text-orange-600">{{ maxPrice }}€</div>
        <div class="text-xs text-stone-500 mt-0.5">plus chère</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4 mb-5 flex flex-wrap gap-3 items-center">
      <input
        v-model="search"
        type="text"
        placeholder="🔍  Rechercher une recette ou un ingrédient…"
        class="input flex-1 min-w-48"
      />
      <select v-model="filterIngredient" class="select">
        <option value="">Tous les ingrédients</option>
        <option v-for="name in allIngredientNames" :key="name" :value="name">{{ name }}</option>
      </select>
      <select v-model="sortBy" class="select">
        <option value="name">Trier par nom</option>
        <option value="price_asc">Prix croissant</option>
        <option value="price_desc">Prix décroissant</option>
      </select>
      <div class="flex items-center gap-2 ml-auto">
        <span class="text-stone-400 text-sm">{{ filteredRecipes.length }} résultat{{ filteredRecipes.length > 1 ? 's' : '' }}</span>
        <button
          v-if="search || filterIngredient"
          @click="search = ''; filterIngredient = ''"
          class="btn-ghost text-xs py-1 px-2"
        >
          Effacer
        </button>
      </div>
    </div>

    <!-- Recipe grid -->
    <div
      v-if="filteredRecipes.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="recipe in filteredRecipes"
        :key="recipe.name"
        @click="selectedRecipe = recipe"
        class="card p-4 cursor-pointer hover:shadow-md hover:border-amber-300 border border-transparent transition-all duration-150 group"
      >
        <!-- Name + price -->
        <div class="flex items-start justify-between gap-2 mb-3">
          <h3 class="font-semibold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug text-sm">
            {{ recipe.name }}
          </h3>
          <span :class="priceBadgeClass(recipe.price)" class="shrink-0 text-sm font-bold px-2.5 py-1 rounded-full">
            {{ recipe.price }}€
          </span>
        </div>

        <!-- Ingredient pills -->
        <div class="flex flex-wrap gap-1">
          <button
            v-for="ing in recipe.ingredients"
            :key="ing"
            @click.stop="filterIngredient = ing"
            class="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full hover:bg-amber-200 transition-colors"
            :title="`Filtrer par ${ing}`"
          >
            {{ ing }}
          </button>
        </div>

        <!-- Footer -->
        <div class="mt-3 flex items-center justify-between text-xs text-stone-400">
          <span>{{ recipe.ingredients.length }} ingrédient{{ recipe.ingredients.length > 1 ? 's' : '' }}</span>
          <span class="text-amber-500 group-hover:text-amber-700 transition-colors">Voir →</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center justify-center py-20 text-stone-400">
      <span class="text-6xl mb-4">🍽️</span>
      <p class="text-lg font-medium">Aucune recette trouvée</p>
      <button @click="search = ''; filterIngredient = ''" class="mt-3 text-amber-600 hover:underline text-sm">
        Réinitialiser les filtres
      </button>
    </div>

    <!-- Modal -->
    <RecipeModal :recipe="selectedRecipe" @close="selectedRecipe = null" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { recipes, priceBadgeClass } from '../data.js'
import RecipeModal from '../components/RecipeModal.vue'

const search = ref('')
const filterIngredient = ref('')
const sortBy = ref('name')
const selectedRecipe = ref(null)

const minPrice = computed(() => Math.min(...recipes.map(r => r.price)))
const maxPrice = computed(() => Math.max(...recipes.map(r => r.price)))
const avgPrice = computed(() => Math.round(recipes.reduce((s, r) => s + r.price, 0) / recipes.length))

const allIngredientNames = computed(() => {
  const names = new Set()
  recipes.forEach(r => r.ingredients.forEach(i => names.add(i)))
  return [...names].sort((a, b) => a.localeCompare(b, 'fr'))
})

const filteredRecipes = computed(() => {
  let result = recipes

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(
      r =>
        r.name.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.toLowerCase().includes(q))
    )
  }

  if (filterIngredient.value) {
    result = result.filter(r => r.ingredients.includes(filterIngredient.value))
  }

  return result.slice().sort((a, b) => {
    if (sortBy.value === 'name') return a.name.localeCompare(b.name, 'fr')
    if (sortBy.value === 'price_asc') return a.price - b.price
    if (sortBy.value === 'price_desc') return b.price - a.price
    return 0
  })
})
</script>
