<template>
  <div>
    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="stat-card">
        <div class="text-2xl font-bold text-amber-700">{{ ingredients.length }}</div>
        <div class="text-xs text-stone-500 mt-0.5">ingrédients</div>
      </div>
      <div class="stat-card">
        <div class="text-2xl font-bold text-emerald-600">{{ minPrice }}€</div>
        <div class="text-xs text-stone-500 mt-0.5">moins cher</div>
      </div>
      <div class="stat-card">
        <div class="text-2xl font-bold text-orange-600">{{ maxPrice }}€</div>
        <div class="text-xs text-stone-500 mt-0.5">plus cher</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4 mb-5 flex flex-wrap gap-3 items-center">
      <input
        v-model="search"
        type="text"
        placeholder="🔍  Rechercher un ingrédient…"
        class="input flex-1 min-w-48"
      />
      <select v-model="sortBy" class="select">
        <option value="name">Trier par nom</option>
        <option value="price_asc">Prix croissant</option>
        <option value="price_desc">Prix décroissant</option>
      </select>
      <span class="text-stone-400 text-sm ml-auto">{{ filtered.length }} résultat{{ filtered.length > 1 ? 's' : '' }}</span>
    </div>

    <!-- Grid -->
    <div
      v-if="filtered.length"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
    >
      <div
        v-for="ing in filtered"
        :key="ing.name"
        class="card p-4 hover:shadow-md hover:border-amber-200 border border-transparent transition-all duration-150"
      >
        <div class="font-medium text-stone-700 text-sm leading-tight mb-3">{{ ing.name }}</div>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold text-amber-700">{{ ing.price }}€</span>
          <span
            class="text-xs text-stone-400 text-right leading-tight"
            :title="`Utilisé dans ${recipeCount(ing.name)} recette(s)`"
          >
            {{ recipeCount(ing.name) }}
            <br />recette{{ recipeCount(ing.name) > 1 ? 's' : '' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center justify-center py-20 text-stone-400">
      <span class="text-6xl mb-4">🥬</span>
      <p class="text-lg font-medium">Aucun ingrédient trouvé</p>
      <button @click="search = ''" class="mt-3 text-amber-600 hover:underline text-sm">Effacer la recherche</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ingredients, recipes } from '../data.js'

const search = ref('')
const sortBy = ref('name')

const minPrice = computed(() => Math.min(...ingredients.map(i => i.price)))
const maxPrice = computed(() => Math.max(...ingredients.map(i => i.price)))

const filtered = computed(() => {
  let result = ingredients
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(i => i.name.toLowerCase().includes(q))
  }
  return result.slice().sort((a, b) => {
    if (sortBy.value === 'name') return a.name.localeCompare(b.name, 'fr')
    if (sortBy.value === 'price_asc') return a.price - b.price
    return b.price - a.price
  })
})

function recipeCount(name) {
  return recipes.filter(r => r.ingredients.includes(name)).length
}
</script>
