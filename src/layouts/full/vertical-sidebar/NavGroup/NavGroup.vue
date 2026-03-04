<script setup>
const props = defineProps({ item: Object });
</script>

<template>
  <v-list-subheader class="nav-group-header">
    <span class="group-title">{{ props.item.header }}</span>
    <span class="group-line"></span>
  </v-list-subheader>
</template>

<style scoped>
.nav-group-header {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #ee6f38;
  margin-top: 15px;
  margin-bottom: 5px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 30px;
}

.group-title {
  opacity: 0.85;
}

.group-line {
  flex-grow: 1;
  height: 1px;
  background: #fde8d8;
}
</style>
