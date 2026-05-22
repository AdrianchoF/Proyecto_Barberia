<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useTheme } from 'vuetify';
import { useCustomizerStore } from '@/stores/customizer';
import { watch, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const theme = useTheme();
const customizer = useCustomizerStore();
const authStore = useAuthStore();

onMounted(async () => {
  // Intentar cargar el usuario desde el token al montar la aplicación
  await authStore.initFromUrl();
});

// Sincronizar el tema de Vuetify con el store de customizer
watch(
  () => customizer.theme,
  (newTheme) => {
    theme.global.name.value = newTheme;
  },
  { immediate: true }
);
</script>

<template>
  <RouterView></RouterView>
</template>

<style>
  html {
    scroll-behavior: smooth;
  }
</style>