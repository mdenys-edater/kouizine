import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import RecipesView from './views/RecipesView.vue'
import MultiView from './views/MultiView.vue'
import IngredientsView from './views/IngredientsView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/recettes' },
    { path: '/recettes', component: RecipesView },
    { path: '/menu', component: MultiView },
    { path: '/ingredients', component: IngredientsView },
  ],
})

createApp(App).use(router).mount('#app')
