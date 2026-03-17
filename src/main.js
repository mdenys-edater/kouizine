import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import { isAuthenticated } from './auth.js'
import LoginView from './views/LoginView.vue'
import RecipesView from './views/RecipesView.vue'
import MultiView from './views/MultiView.vue'
import IngredientsView from './views/IngredientsView.vue'
import HelloFreshView from './views/HelloFreshView.vue'
import EchoFrigoView from './views/EchoFrigoView.vue'
import MenuImageView from './views/MenuImageView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/login', component: LoginView, meta: { public: true } },
    { path: '/', redirect: '/recettes' },
    { path: '/recettes', component: RecipesView },
    { path: '/menu', component: MultiView },
    { path: '/ingredients', component: IngredientsView },
    { path: '/hello-fresh', component: HelloFreshView },
    { path: '/echo-frigo', component: EchoFrigoView },
    { path: '/menu-image', component: MenuImageView },
  ],
})

router.beforeEach((to) => {
  if (!to.meta.public && !isAuthenticated.value) {
    return '/login'
  }
  if (to.path === '/login' && isAuthenticated.value) {
    return '/recettes'
  }
})

createApp(App).use(router).mount('#app')
