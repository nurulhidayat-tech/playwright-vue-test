<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

function resolveRedirect(): string {
  const target = route.query.redirect
  if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')) {
    return target
  }
  return '/profile'
}

function onSubmit(): void {
  if (!auth.login(username.value, password.value)) {
    errorMessage.value = 'Invalid username or password.'
    return
  }

  errorMessage.value = ''
  void router.push(resolveRedirect())
}
</script>

<template>
  <section class="card" data-testid="login-page">
    <h1 class="card-title">Sign in</h1>
    <p class="card-subtitle">Use the demo account to explore the profile page.</p>

    <form class="form" data-testid="login-form" @submit.prevent="onSubmit">
      <label class="field">
        <span class="field-label">Username</span>
        <input
          v-model="username"
          data-testid="username-input"
          name="username"
          type="text"
          autocomplete="username"
          placeholder="vue"
          required
        />
      </label>

      <label class="field">
        <span class="field-label">Password</span>
        <input
          v-model="password"
          data-testid="password-input"
          name="password"
          type="password"
          autocomplete="current-password"
          placeholder="vue"
          required
        />
      </label>

      <p v-if="errorMessage" class="alert alert-error" data-testid="login-error" role="alert">
        {{ errorMessage }}
      </p>

      <button class="button" data-testid="login-submit" type="submit">Sign in</button>
    </form>

    <p class="hint">Demo credential: <strong>vue</strong> / <strong>vue</strong></p>
  </section>
</template>
