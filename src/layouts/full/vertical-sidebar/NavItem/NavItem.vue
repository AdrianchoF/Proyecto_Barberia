<script setup>
const props = defineProps({ item: Object, level: Number });
</script>

<template>
  <v-list-item
    :to="item.type === 'external' ? '' : item.to"
    :href="item.type === 'external' ? item.to : ''"
    rounded="xl"
    class="mb-1 nav-item"
    active-class="active-nav-item"
    :disabled="item.disabled"
    :target="item.type === 'external' ? '_blank' : ''"
    density="comfortable"
  >
    <template v-slot:prepend>
      <div class="icon-wrapper">
        <i :class="[item.icon, 'nav-icon']"></i>
      </div>
    </template>
    
    <v-list-item-title class="nav-title">{{ item.title }}</v-list-item-title>
    
    <v-list-item-subtitle v-if="item.subCaption" class="text-caption mt-n1 hide-menu">
      {{ item.subCaption }}
    </v-list-item-subtitle>
    
    <template v-slot:append v-if="item.chip">
      <v-chip
        :color="item.chipColor"
        class="sidebarchip hide-menu"
        :size="item.chipIcon ? 'small' : 'default'"
        :variant="item.chipVariant"
        :prepend-icon="item.chipIcon"
      >
        {{ item.chip }}
      </v-chip>
    </template>
  </v-list-item>
</template>

<style scoped>
.nav-item {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: #555;
  margin-bottom: 4px !important;
  min-height: 48px;
}

.nav-item:hover:not(.active-nav-item) {
  background: #fff8f5;
  color: #ee6f38;
}

.nav-item:hover:not(.active-nav-item) .icon-wrapper {
  color: #ee6f38;
  transform: scale(1.1);
}

.icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: transparent;
  transition: all 0.2s;
  color: #777;
  margin-right: 12px;
}

.nav-icon {
  font-size: 1.15rem;
}

.nav-title {
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.2px;
}

.active-nav-item {
  background: linear-gradient(135deg, #ee6f38, #d45a22) !important;
  color: white !important;
  box-shadow: 0 4px 14px rgba(238, 111, 56, 0.25);
}

.active-nav-item .icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  color: white !important;
}

.active-nav-item .nav-title {
  font-weight: 600;
}
</style>
