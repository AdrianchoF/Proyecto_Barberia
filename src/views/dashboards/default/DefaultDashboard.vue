<script setup>
  // imported components
  import { computed } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import TotalEarning from './components/TotalEarning.vue';
  import TotalOrder from './components/TotalOrder.vue';
  import TotalIncome from './components/TotalIncome.vue';
  import TotalGrowth from './components/TotalGrowth.vue';
  import PopularStocks from './components/PopularStocks.vue';
  import BannerbienvenidaAdmin from './components/administrador/BannerbienvenidaAdmin.vue';

  const authStore = useAuthStore();
  const userRole = computed(() => authStore.user?.Role);

  console.log('Usuario:', authStore.user);
  console.log('Role:', userRole.value);
</script>

<template>
  <v-row>
    <!-- -------------------------------------------------------------------- -->
    <!-- Total Earning -->
    <!-- -------------------------------------------------------------------- -->
    <v-col cols="12">
      <BannerbienvenidaAdmin v-if="userRole === 'administrador'"></BannerbienvenidaAdmin>
      <br>
    </v-col>
    <v-col cols="12" md="4">
      <TotalOrder />
    </v-col>
    <TotalEarning></TotalEarning>
    <!-- -------------------------------------------------------------------- -->
    <!-- Total Order -->
    <!-- -------------------------------------------------------------------- -->
    
    <!-- -------------------------------------------------------------------- -->
    <!-- Total Income -->
    <!-- -------------------------------------------------------------------- -->
    <v-col cols="12" md="4">
      <TotalIncome />
    </v-col>

    <!-- -------------------------------------------------------------------- -->
    <!-- Total Growth -->
    <!-- -------------------------------------------------------------------- -->
    <v-col cols="12" lg="8">
      <TotalGrowth />
    </v-col>

    <!-- -------------------------------------------------------------------- -->
    <!-- Popular Stocks -->
    <!-- -------------------------------------------------------------------- -->
    <v-col cols="12" lg="4">
      <PopularStocks />
    </v-col>
  </v-row>
</template>
