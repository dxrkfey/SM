<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
</script>

<template>
  <div class="app-container">
    <Sidebar class="sidebar" />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  position: sticky;
  top: 0;
  flex-shrink: 0;
}

.main-content {
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
}


</style>
