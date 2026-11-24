<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <span class="app-brand">Vue Auth</span>
      <span class="app-badge">Playwright UI Test</span>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <footer class="app-footer">Default credential: vue / vue</footer>
  </div>
</template>
