<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useTheme } from 'vuetify';
import { useCustomizerStore } from '@/stores/customizer';
import { watch } from 'vue';

const theme = useTheme();
const customizer = useCustomizerStore();

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