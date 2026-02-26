<template>
  <Transition name="modal">
    <div
      v-if="recipe"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />

      <!-- Card -->
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-br from-teal-700 to-emerald-500 text-white p-6 pb-5">
          <button
            @click="emit('close')"
            class="absolute top-4 right-4 text-teal-200 hover:text-white transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"
          >
            ✕
          </button>
          <h2 class="text-xl font-bold leading-tight pr-8">{{ recipe.name }}</h2>
          <p class="text-teal-200 text-sm mt-1">
            {{ recipe.ingredients.length }} ingrédient{{ recipe.ingredients.length > 1 ? 's' : '' }}
            <span v-if="fishCount > 0" class="ml-1">· 🎣 {{ fishCount }} à pêcher</span>
          </p>
        </div>

        <!-- Body -->
        <div class="p-6">
          <p class="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Ingrédients</p>
          <div class="space-y-1.5">
            <div
              v-for="(ing, idx) in ingredientDetails"
              :key="`${ing.name}-${idx}`"
              class="flex items-center justify-between py-2 border-b border-stone-50 last:border-0"
            >
              <div class="flex items-center gap-2">
                <span
                  :class="ing.isFish ? 'w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0' : 'w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0'"
                />
                <span class="text-stone-700 text-sm">{{ ing.name }}</span>
              </div>
              <span v-if="ing.isFish" class="text-blue-500 text-xs font-medium flex items-center gap-1">
                🎣 Pêche
              </span>
              <span v-else class="text-stone-400 text-sm font-medium">{{ ing.price }}€</span>
            </div>
          </div>

          <!-- Total -->
          <div class="mt-5 pt-4 border-t-2 border-stone-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-stone-400 font-medium">Prix de vente</p>
                <p class="text-stone-600 text-xs mt-0.5">Affiché au menu</p>
              </div>
              <span class="text-3xl font-bold text-emerald-600">{{ recipe.price }}€</span>
            </div>
            <div v-if="fishCount > 0" class="flex items-center justify-between mt-2">
              <div>
                <p class="text-xs text-stone-400 font-medium">Coût achats</p>
                <p class="text-blue-500 text-xs mt-0.5">🎣 {{ fishCount }} ingrédient{{ fishCount > 1 ? 's' : '' }} gratuit{{ fishCount > 1 ? 's' : '' }}</p>
              </div>
              <span class="text-xl font-bold text-stone-600">{{ purchaseCost }}€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { getIngredientPrice, fishIngredients } from '../data.js'

const props = defineProps({
  recipe: Object,
})

const emit = defineEmits(['close'])

const ingredientDetails = computed(() => {
  if (!props.recipe) return []
  return props.recipe.ingredients.map(name => ({
    name,
    price: getIngredientPrice(name),
    isFish: fishIngredients.has(name),
  }))
})

const fishCount = computed(() =>
  ingredientDetails.value.filter(i => i.isFish).length
)

const purchaseCost = computed(() =>
  ingredientDetails.value.filter(i => !i.isFish).reduce((s, i) => s + i.price, 0)
)
</script>

<style scoped>
.modal-enter-active {
  transition: opacity 0.2s ease;
}
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}
.modal-enter-from .relative {
  transform: scale(0.95) translateY(8px);
}
.modal-leave-to .relative {
  transform: scale(0.97) translateY(4px);
}
</style>
