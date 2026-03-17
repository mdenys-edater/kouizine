<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-stone-800 dark:text-stone-100">🖼️ Menu de la semaine</h2>
        <p class="text-stone-500 dark:text-stone-400 text-sm mt-1">
          Sélectionnez les plats à afficher puis téléchargez l'image
        </p>
      </div>
      <button
        @click="downloadImage"
        :disabled="!selection.length"
        class="btn-primary text-base px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ⬇ Télécharger l'image
      </button>
    </div>

    <div class="grid lg:grid-cols-[300px_1fr] gap-6 items-start">

      <!-- ── Sélection (sticky) ── -->
      <div class="lg:sticky lg:top-20 card p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-stone-700 dark:text-stone-200">Plats à afficher</h3>
          <div class="flex gap-2">
            <button
              v-if="selection.length"
              @click="selection = []"
              class="text-xs text-red-400 hover:text-red-600 transition-colors"
            >Vider</button>
            <button
              @click="pickRandom"
              class="text-xs text-teal-600 hover:text-teal-800 dark:hover:text-teal-400 transition-colors font-medium"
            >🎲 Aléatoire</button>
          </div>
        </div>

        <input
          v-model="search"
          type="text"
          placeholder="🔍 Rechercher…"
          class="input w-full mb-3"
        />

        <!-- Tabs catégories -->
        <div class="flex gap-1 mb-3">
          <button
            v-for="cat in ['Tous', 'Plats', 'Desserts', 'Boissons']"
            :key="cat"
            @click="catFilter = cat"
            :class="[
              'text-xs px-2.5 py-1 rounded-full transition-colors',
              catFilter === cat
                ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 font-semibold'
                : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800',
            ]"
          >{{ cat }}</button>
        </div>

        <div class="space-y-0.5 max-h-[55vh] overflow-y-auto -mx-1 px-1">
          <button
            v-for="r in filteredRecipes"
            :key="r.name"
            @click="toggleRecipe(r)"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between gap-2',
              isSelected(r)
                ? 'bg-teal-50 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-medium'
                : 'hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300',
            ]"
          >
            <span class="truncate">{{ r.name }}</span>
          </button>
        </div>

        <div class="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700 text-xs text-stone-400">
          {{ selection.length }} plat{{ selection.length > 1 ? 's' : '' }} sélectionné{{ selection.length > 1 ? 's' : '' }}
        </div>
      </div>

      <!-- ── Aperçu canvas ── -->
      <div>
        <div v-if="!selection.length" class="flex flex-col items-center justify-center py-24 text-stone-400 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl">
          <div class="text-7xl mb-5 select-none">🍽️</div>
          <p class="text-lg font-semibold text-stone-600 dark:text-stone-300">Aucun plat sélectionné</p>
          <p class="text-sm mt-2">Choisissez des plats dans la liste pour générer l'image.</p>
        </div>
        <div v-else>
          <p class="text-xs text-stone-400 mb-3 text-right">Aperçu · cliquez sur Télécharger pour sauvegarder en PNG</p>
          <canvas
            ref="canvasRef"
            class="w-full rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { recipes } from '../data.js'

const DESSERT_NAMES = new Set([
  'Cookies', 'Crepe', 'Dango Fruite', "Donut's fraise", 'Fleur aux pommes',
  'Fondant chocolat', "Gateau d'anniversaire", "Gateau de semoule a l'orange",
  'Gauffre Nature', 'Gauffre au sucre', '3x Macarons', 'Mochi Fraise-Chocolat',
  'Mousse au Chocolat', 'Muffins au chocolat', 'Pain perdu', 'Riz au lait',
  'Salade de fruit', 'Tarte au pomme', 'Tartelette citron', 'Tartelette fraise',
  'Tartine de confiture de fraise',
])
const DRINK_NAMES = new Set([
  'Chocolat Chaud', '3x Limonades', 'Milkshake chocolat', 'Milkshake fraise', '3x Smoothie aux fruits',
])

function getCategory(r) {
  if (DRINK_NAMES.has(r.name)) return 'Boissons'
  if (DESSERT_NAMES.has(r.name)) return 'Desserts'
  return 'Plats'
}

const canvasRef = ref(null)
const selection = ref([])
const search = ref('')
const catFilter = ref('Tous')

const filteredRecipes = computed(() => {
  let list = recipes
  if (catFilter.value !== 'Tous') list = list.filter(r => getCategory(r) === catFilter.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(r => r.name.toLowerCase().includes(q))
  }
  return list
})

function isSelected(r) {
  return selection.value.some(s => s.name === r.name)
}

function toggleRecipe(r) {
  const idx = selection.value.findIndex(s => s.name === r.name)
  if (idx !== -1) selection.value.splice(idx, 1)
  else selection.value.push(r)
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom() {
  const plats = recipes.filter(r => getCategory(r) === 'Plats')
  const desserts = recipes.filter(r => getCategory(r) === 'Desserts')
  selection.value = [
    ...shuffle(plats).slice(0, 7),
    ...shuffle(desserts).slice(0, 2),
  ]
}

// ── Canvas drawing ────────────────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (ctx.measureText(t + '…').width > maxWidth && t.length > 0) t = t.slice(0, -1)
  return t + '…'
}

function drawMenu() {
  const canvas = canvasRef.value
  if (!canvas || !selection.value.length) return
  const ctx = canvas.getContext('2d')

  // ── Dimensions ──────────────────────────────────────────────────────────────
  const W = 900
  const COLS = selection.value.length === 1 ? 1 : 2
  const PAD = 54
  const HEADER_H = 150
  const CARD_H = 68
  const CARD_GAP = 12
  const SECTION_GAP = 32
  const FOOTER_H = 70

  const groups = []
  const categories = ['Plats', 'Desserts', 'Boissons']
  for (const cat of categories) {
    const items = selection.value.filter(r => getCategory(r) === cat)
    if (items.length) groups.push({ cat, items })
  }

  let bodyH = 0
  for (const g of groups) {
    bodyH += 40
    const rows = Math.ceil(g.items.length / COLS)
    bodyH += rows * CARD_H + (rows - 1) * CARD_GAP + SECTION_GAP
  }

  const H = HEADER_H + PAD + bodyH + FOOTER_H
  canvas.width = W
  canvas.height = H

  const CARD_W = (W - PAD * 2 - CARD_GAP) / COLS

  // ── Background ──────────────────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W, H)
  bgGrad.addColorStop(0, '#0d2f2c')
  bgGrad.addColorStop(1, '#0a1f1e')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(255,255,255,0.012)'
  for (let i = 0; i < 2000; i++) {
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1)
  }

  // ── Outer double border ──────────────────────────────────────────────────────
  ctx.strokeStyle = '#2dd4bf'
  ctx.lineWidth = 2
  roundRect(ctx, 18, 18, W - 36, H - 36, 16)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(45,212,191,0.25)'
  ctx.lineWidth = 1
  roundRect(ctx, 26, 26, W - 52, H - 52, 12)
  ctx.stroke()

  // ── Header ──────────────────────────────────────────────────────────────────
  const cx = W / 2
  ctx.strokeStyle = '#2dd4bf'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(PAD + 10, 72); ctx.lineTo(cx - 160, 72); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx + 160, 72); ctx.lineTo(W - PAD - 10, 72); ctx.stroke()

  ctx.fillStyle = '#2dd4bf'
  ;[[cx - 160, 72], [cx + 160, 72]].forEach(([dx, dy]) => {
    ctx.save(); ctx.translate(dx, dy); ctx.rotate(Math.PI / 4)
    ctx.fillRect(-5, -5, 10, 10); ctx.restore()
  })

  ctx.fillStyle = '#f0fdfa'
  ctx.font = 'bold 46px Georgia, "Times New Roman", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Echo Fresh', cx, 72)

  const lineY = 118
  ctx.strokeStyle = 'rgba(45,212,191,0.4)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD, lineY); ctx.lineTo(W - PAD, lineY); ctx.stroke()

  // ── Sections ─────────────────────────────────────────────────────────────────
  let curY = HEADER_H + 16

  for (const { cat, items } of groups) {
    ctx.fillStyle = '#2dd4bf'
    ctx.font = '600 13px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(cat.toUpperCase(), PAD, curY + 12)

    const labelW = ctx.measureText(cat.toUpperCase()).width
    ctx.strokeStyle = 'rgba(45,212,191,0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(PAD + labelW + 10, curY + 12)
    ctx.lineTo(W - PAD, curY + 12)
    ctx.stroke()

    curY += 36

    const rows = Math.ceil(items.length / COLS)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < COLS; col++) {
        const idx = row * COLS + col
        if (idx >= items.length) break
        const recipe = items[idx]

        const x = PAD + col * (CARD_W + CARD_GAP)
        const y = curY + row * (CARD_H + CARD_GAP)

        roundRect(ctx, x, y, CARD_W, CARD_H, 10)
        ctx.fillStyle = 'rgba(255,255,255,0.07)'
        ctx.fill()
        roundRect(ctx, x, y, CARD_W, CARD_H, 10)
        ctx.strokeStyle = 'rgba(45,212,191,0.15)'
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.fillStyle = '#14b8a6'
        roundRect(ctx, x, y + 14, 3, CARD_H - 28, 2)
        ctx.fill()

        ctx.fillStyle = '#e2fefa'
        ctx.font = '500 20px system-ui, -apple-system, sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(fitText(ctx, recipe.name, CARD_W - 36), x + 18, y + CARD_H / 2)
      }
    }

    curY += rows * CARD_H + (rows - 1) * CARD_GAP + SECTION_GAP
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(45,212,191,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD, H - FOOTER_H); ctx.lineTo(W - PAD, H - FOOTER_H); ctx.stroke()

  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.font = '500 15px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✦  By Echo for all Egos  ✦', cx, H - FOOTER_H / 2)
}

watch(selection, () => nextTick(drawMenu), { deep: true })

function downloadImage() {
  const canvas = canvasRef.value
  if (!canvas) return
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = 'menu-semaine.png'
  a.click()
}
</script>
