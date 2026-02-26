import { ref } from 'vue'

const CREDENTIALS = { username: 'echo', password: 'kouizine' }
const SESSION_KEY = 'kouizine_auth'

export const isAuthenticated = ref(!!sessionStorage.getItem(SESSION_KEY))

export function login(username, password) {
  if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
    sessionStorage.setItem(SESSION_KEY, '1')
    isAuthenticated.value = true
    return true
  }
  return false
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
  isAuthenticated.value = false
}
