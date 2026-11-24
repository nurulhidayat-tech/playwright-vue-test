import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const DEFAULT_USERNAME = 'vue'
export const DEFAULT_PASSWORD = 'vue'
export const AUTH_STORAGE_KEY = 'vue-auth'

type StoredSession = {
  username: string
}

function loadSession(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'username' in parsed &&
      typeof (parsed as StoredSession).username === 'string' &&
      (parsed as StoredSession).username.length > 0
    ) {
      return (parsed as StoredSession).username
    }
    return null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const username = ref<string | null>(loadSession())
  const isAuthenticated = computed(() => username.value !== null)

  function login(user: string, password: string): boolean {
    if (user !== DEFAULT_USERNAME || password !== DEFAULT_PASSWORD) {
      return false
    }
    username.value = DEFAULT_USERNAME
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ username: DEFAULT_USERNAME }))
    return true
  }

  function logout(): void {
    username.value = null
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return { username, isAuthenticated, login, logout }
})
