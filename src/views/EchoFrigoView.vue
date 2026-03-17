<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-stone-800">🧊 Echo-frigo</h2>
      <p class="text-stone-500 text-sm mt-1">
        Sélectionnez ce que vous avez pour découvrir les recettes réalisables
      </p>
    </div>

    <div class="grid lg:grid-cols-[300px_1fr] gap-6 items-start">

      <!-- ── Frigo (sticky) ── -->
      <div class="lg:sticky lg:top-20 card p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-stone-700">🧊 Mon frigo</h3>
          <button
            v-if="fridge.size"
            @click="clearFridge"
            class="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Tout vider
          </button>
        </div>

        <input
          v-model="search"
          type="text"
          placeholder="🔍 Rechercher…"
          class="input w-full mb-3"
        />

        <div class="space-y-0.5 max-h-[60vh] overflow-y-auto -mx-1 px-1">
          <button
            v-for="ing in filteredIngredients"
            :key="ing.name"
            @click="toggleFridge(ing.name)"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2',
              fridge.has(ing.name)
                ? 'bg-teal-50 text-teal-800 font-medium'
                : 'hover:bg-stone-50 text-stone-600',
            ]"
          >
            <span class="w-4 text-center text-teal-500">{{ fridge.has(ing.name) ? '✓' : '' }}</span>
            {{ ing.name }}
          </button>
        </div>

        <div v-if="fridge.size" class="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-400">
          {{ fridge.size }} ingrédient{{ fridge.size > 1 ? 's' : '' }} sélectionné{{ fridge.size > 1 ? 's' : '' }}
        </div>
      </div>

      <!-- ── Recettes ── -->
      <div>

        <!-- Filtres -->
        <div v-if="fridge.size" class="flex flex-wrap gap-2 mb-4">
          <button @click="filter = 'all'" :class="tabClass('all')">
            Toutes ({{ suggestedRecipes.length }})
          </button>
          <button @click="filter = 'ready'" :class="tabClass('ready')">
            ✓ Prêtes ({{ readyCount }})
          </button>
          <button @click="filter = 'almost'" :class="tabClass('almost')">
            Presque ({{ almostCount }})
          </button>
        </div>

        <!-- Empty state : frigo vide -->
        <div v-if="!fridge.size" class="flex flex-col items-center justify-center py-24 text-stone-400">
          <div class="text-7xl mb-5 select-none">🧊</div>
          <p class="text-lg font-semibold text-stone-600">Frigo vide</p>
          <p class="text-sm mt-2 text-center max-w-sm leading-relaxed">
            Sélectionnez les ingrédients que vous avez pour voir les recettes disponibles.
          </p>
        </div>

        <!-- Empty state : aucun résultat pour ce filtre -->
        <div v-else-if="filteredRecipes.length === 0" class="flex flex-col items-center justify-center py-24 text-stone-400">
          <div class="text-7xl mb-5 select-none">🤷</div>
          <p class="text-lg font-semibold text-stone-600">Aucune recette</p>
          <p class="text-sm mt-2">Essayez un autre filtre ou ajoutez des ingrédients.</p>
        </div>

        <!-- Grille de recettes -->
        <div v-else class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <div
            v-for="item in filteredRecipes"
            :key="item.recipe.name"
            class="card p-4 flex flex-col gap-3"
          >
            <!-- Nom + compteur -->
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-semibold text-stone-800 text-sm leading-tight">{{ item.recipe.name }}</h4>
              <span
                :class="[
                  'badge shrink-0 font-semibold',
                  item.missing.length === 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700',
                ]"
              >
                {{ item.have }}/{{ item.total }}
              </span>
            </div>

            <!-- Ingrédients colorés -->
            <div class="flex flex-wrap gap-1">
              <span
                v-for="ing in item.recipe.ingredients"
                :key="ing"
                :class="[
                  'badge text-xs',
                  fridge.has(ing)
                    ? 'bg-teal-50 text-teal-700'
                    : 'bg-red-50 text-red-500 line-through',
                ]"
              >{{ ing }}</span>
            </div>

            <!-- Pied de carte -->
            <div class="pt-2 border-t border-stone-100 mt-auto">
              <div v-if="item.missing.length === 0" class="text-xs text-emerald-600 font-medium">
                ✓ Tout disponible !
              </div>
              <div v-else>
                <p class="text-xs text-stone-400 mb-1.5">À racheter</p>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="m in item.missing"
                    :key="m.name"
                    class="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full"
                  >
                    {{ m.name }}&nbsp;<span class="text-stone-400">{{ m.price }}€</span>
                  </span>
                </div>
                <p class="text-right text-xs font-semibold text-amber-600 mt-1.5">
                  +{{ item.missingCost }}€ manquant
                </p>
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
import { recipes, ingredients, getIngredientPrice } from '../data.js'

const STORAGE_KEY = 'echoFrigoContents'

function loadFridge() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

const fridge = ref(loadFridge())
const search = ref('')
const filter = ref('all')

function saveFridge() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...fridge.value]))
}

function toggleFridge(name) {
  const next = new Set(fridge.value)
  next.has(name) ? next.delete(name) : next.add(name)
  fridge.value = next
  saveFridge()
}

function clearFridge() {
  fridge.value = new Set()
  saveFridge()
}

const filteredIngredients = computed(() => {
  if (!search.value.trim()) return ingredients
  const q = search.value.toLowerCase()
  return ingredients.filter(i => i.name.toLowerCase().includes(q))
})

const suggestedRecipes = computed(() => {
  return recipes
    .map(recipe => {
      const missing = recipe.ingredients
        .filter(ing => !fridge.value.has(ing))
        .map(ing => ({ name: ing, price: getIngredientPrice(ing) }))
      const have = recipe.ingredients.length - missing.length
      return {
        recipe,
        have,
        total: recipe.ingredients.length,
        missing,
        missingCost: missing.reduce((s, m) => s + m.price, 0),
      }
    })
    .filter(item => item.have > 0)
    .sort((a, b) => a.missing.length - b.missing.length || b.have - a.have)
})

const readyCount = computed(() => suggestedRecipes.value.filter(i => i.missing.length === 0).length)
const almostCount = computed(() => suggestedRecipes.value.filter(i => i.missing.length >= 1 && i.missing.length <= 2).length)

const filteredRecipes = computed(() => {
  if (filter.value === 'ready') return suggestedRecipes.value.filter(i => i.missing.length === 0)
  if (filter.value === 'almost') return suggestedRecipes.value.filter(i => i.missing.length >= 1 && i.missing.length <= 2)
  return suggestedRecipes.value
})

function tabClass(f) {
  return filter.value === f
    ? 'btn-primary text-sm px-3 py-1.5'
    : 'text-sm px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors'
}
</script>
