<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="card" data-testid="not-found-page">
    <p class="eyebrow">404</p>
    <h1 class="card-title">Page not found</h1>
    <p class="card-subtitle">The page you are looking for does not exist.</p>
    <RouterLink class="button" to="/">Back to home</RouterLink>
  </section>
</template>
