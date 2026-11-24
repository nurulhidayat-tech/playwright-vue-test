<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

function onLogout(): void {
  auth.logout()
  void router.push({ name: 'login' })
}
</script>

<template>
  <section class="card" data-testid="profile-page">
    <p class="eyebrow">Profile</p>
    <h1 class="card-title">Welcome back</h1>

    <dl class="details">
      <div class="detail-row">
        <dt>Username</dt>
        <dd><span data-testid="profile-username">{{ auth.username }}</span></dd>
      </div>
      <div class="detail-row">
        <dt>Role</dt>
        <dd>Demo user</dd>
      </div>
      <div class="detail-row">
        <dt>Session</dt>
        <dd>Stored in localStorage</dd>
      </div>
    </dl>

    <button class="button button-danger" data-testid="logout-button" type="button" @click="onLogout">
      Log out
    </button>
  </section>
</template>
