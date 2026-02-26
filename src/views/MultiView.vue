<template>
  <div class="grid lg:grid-cols-[1fr_360px] gap-6 items-start">

    <!-- ── LEFT: sélection + picker ── -->
    <div>
      <!-- Header -->
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-stone-800">Composition du menu</h2>
          <p class="text-stone-500 text-sm mt-1">
            Sélectionnez vos recettes et ajustez les quantités
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-stone-500">
            <span class="font-bold text-amber-700">{{ selected.length }}</span>/{{ MAX_SELECT }} recettes
          </span>
          <button
            v-if="selected.length"
            @click="selected = []"
            class="btn-ghost text-red-400 hover:text-red-600 hover:bg-red-50 text-sm"
          >
            Tout effacer
          </button>
        </div>
      </div>

      <!-- Selected recipe cards -->
      <div v-if="selected.length" class="grid sm:grid-cols-2 gap-3 mb-5">
        <div
          v-for="item in selected"
          :key="item.recipe.name"
          class="card border border-amber-200 p-4"
        >
          <!-- Name + remove -->
          <div class="flex items-start justify-between gap-2 mb-3">
            <h4 class="font-bold text-stone-800 text-sm leading-tight">{{ item.recipe.name }}</h4>
            <button
              @click="removeRecipe(item.recipe)"
              class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- Qty control -->
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs text-stone-400">Nombre de plats</span>
            <div class="flex items-center gap-2">
              <button
                @click="changeQty(item, -1)"
                class="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-base transition-colors flex items-center justify-center leading-none"
              >−</button>
              <span class="font-bold text-amber-700 w-7 text-center tabular-nums">{{ item.qty }}</span>
              <button
                @click="changeQty(item, +1)"
                class="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold text-base transition-colors flex items-center justify-center leading-none"
              >+</button>
            </div>
          </div>

          <!-- Subtotal -->
          <div class="pt-2.5 border-t border-stone-100 flex items-center justify-between">
            <span class="text-xs text-stone-400">{{ item.qty }} × {{ item.recipe.price }}€</span>
            <span class="font-bold text-emerald-600">{{ item.qty * item.recipe.price }}€</span>
          </div>
        </div>

        <!-- Empty slots -->
        <div
          v-for="i in MAX_SELECT - selected.length"
          :key="`slot-${i}`"
          class="border-2 border-dashed border-stone-200 rounded-xl p-4 flex flex-col items-center justify-center text-stone-300 min-h-28 select-none"
        >
          <span class="text-3xl mb-1">+</span>
          <span class="text-xs">Ajouter une recette</span>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="border-2 border-dashed border-amber-200 rounded-xl p-12 text-center text-stone-400 mb-5"
      >
        <div class="text-5xl mb-3">📋</div>
        <p class="font-medium">Aucune recette sélectionnée</p>
        <p class="text-sm mt-1">Cliquez sur les recettes ci-dessous pour les ajouter</p>
      </div>

      <!-- Recipe picker -->
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <h3 class="font-semibold text-stone-700">Choisir des recettes</h3>
          <input
            v-model="search"
            type="text"
            placeholder="🔍  Rechercher…"
            class="input flex-1 min-w-40"
          />
          <span class="text-stone-400 text-sm shrink-0">{{ filtered.length }} recettes</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <button
            v-for="recipe in filtered"
            :key="recipe.name"
            @click="toggleRecipe(recipe)"
            :disabled="!isSelected(recipe) && selected.length >= MAX_SELECT"
            :class="[
              'text-left p-3 rounded-xl border-2 transition-all duration-150',
              isSelected(recipe)
                ? 'bg-amber-50 border-amber-400 shadow-sm'
                : 'bg-stone-50 border-transparent hover:border-stone-200',
              !isSelected(recipe) && selected.length >= MAX_SELECT
                ? 'opacity-40 cursor-not-allowed'
                : 'cursor-pointer',
            ]"
          >
            <div
              class="font-medium leading-tight mb-1 text-xs"
              :class="isSelected(recipe) ? 'text-amber-800' : 'text-stone-700'"
            >
              {{ recipe.name }}
            </div>
            <div class="flex items-center justify-between">
              <span
                class="text-xs"
                :class="isSelected(recipe) ? 'text-amber-600' : 'text-stone-400'"
              >{{ recipe.price }}€</span>
              <span v-if="isSelected(recipe)" class="text-amber-500 text-xs font-bold">✓</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- ── RIGHT: liste de courses (sticky) ── -->
    <div class="lg:sticky lg:top-20">
      <div class="card p-5">
        <div class="flex items-center justify-between mb-1">
          <h3 class="font-bold text-stone-800 text-base">🛒 Liste de courses</h3>
          <span v-if="shoppingList.length" class="text-xs text-stone-400">
            {{ shoppingList.length }} article{{ shoppingList.length > 1 ? 's' : '' }}
          </span>
        </div>
        <p class="text-xs text-stone-400 mb-4">Se met à jour automatiquement</p>

        <Transition name="fade" mode="out-in">
          <div v-if="shoppingList.length" key="list">
            <!-- Ingredient list -->
            <div class="space-y-1 mb-4 max-h-[50vh] overflow-y-auto -mx-1 px-1">
              <div
                v-for="item in shoppingList"
                :key="item.name"
                class="flex items-center justify-between py-2 border-b border-stone-50 last:border-0 gap-3"
              >
                <div class="min-w-0">
                  <div class="text-sm text-stone-700 font-medium truncate">{{ item.name }}</div>
                  <div class="text-xs text-stone-400">
                    {{ item.count }}×
                    <span class="text-stone-300 mx-0.5">·</span>
                    {{ item.unitPrice }}€/u
                  </div>
                </div>
                <span class="font-semibold text-stone-700 shrink-0 tabular-nums">
                  {{ item.total }}€
                </span>
              </div>
            </div>

            <!-- Summary footer -->
            <div class="pt-4 border-t-2 border-stone-100 space-y-1.5">
              <div class="flex justify-between text-sm text-stone-500">
                <span>{{ totalDishes }} plat{{ totalDishes > 1 ? 's' : '' }}</span>
                <span>{{ selected.length }} recette{{ selected.length > 1 ? 's' : '' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-bold text-stone-800 text-lg">Total ingrédients</span>
                <span class="text-2xl font-bold text-emerald-600 tabular-nums">{{ grandTotal }}€</span>
              </div>
            </div>
          </div>

          <div v-else key="empty" class="text-center py-10 text-stone-400">
            <div class="text-5xl mb-3">🛒</div>
            <p class="text-sm leading-relaxed">
              Sélectionnez des recettes<br />pour voir votre liste de courses
            </p>
          </div>
        </Transition>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { recipes, getIngredientPrice } from '../data.js'

const MAX_SELECT = 8
const search = ref('')
// selected: Array<{ recipe, qty }>
const selected = ref([])

const filtered = computed(() => {
  if (!search.value.trim()) return recipes
  const q = search.value.toLowerCase()
  return recipes.filter(r => r.name.toLowerCase().includes(q))
})

function isSelected(recipe) {
  return selected.value.some(item => item.recipe.name === recipe.name)
}

function toggleRecipe(recipe) {
  const idx = selected.value.findIndex(item => item.recipe.name === recipe.name)
  if (idx !== -1) {
    selected.value.splice(idx, 1)
  } else if (selected.value.length < MAX_SELECT) {
    selected.value.push({ recipe, qty: 1 })
  }
}

function removeRecipe(recipe) {
  const idx = selected.value.findIndex(item => item.recipe.name === recipe.name)
  if (idx !== -1) selected.value.splice(idx, 1)
}

function changeQty(item, delta) {
  item.qty = Math.max(1, Math.min(99, item.qty + delta))
}

// Agrège tous les ingrédients de toutes les recettes × quantités
const shoppingList = computed(() => {
  const map = new Map()
  for (const { recipe, qty } of selected.value) {
    for (const ingName of recipe.ingredients) {
      const unitPrice = getIngredientPrice(ingName)
      if (map.has(ingName)) {
        const entry = map.get(ingName)
        entry.count += qty
        entry.total += unitPrice * qty
      } else {
        map.set(ingName, { name: ingName, count: qty, unitPrice, total: unitPrice * qty })
      }
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
})

const grandTotal = computed(() => shoppingList.value.reduce((sum, i) => sum + i.total, 0))
const totalDishes = computed(() => selected.value.reduce((sum, i) => sum + i.qty, 0))
</script>
