<script setup>
import NavItem from '../NavItem/NavItem.vue';

const props = defineProps({ item: Object, level: Number });
</script>

<template>
  <v-list-group no-action class="nav-group-custom">
    <template v-slot:activator="{ props: activatorProps }">
      <v-list-item 
        v-bind="activatorProps" 
        :value="item.title" 
        rounded="xl" 
        class="mb-2 nav-collapse-item"
        density="comfortable"
      >
        <template v-slot:prepend>
          <div class="icon-wrapper">
            <i :class="[item.icon, 'nav-icon']"></i>
          </div>
        </template>
        
        <v-list-item-title class="mr-auto nav-title">{{ item.title }}</v-list-item-title>
        
        <v-list-item-subtitle v-if="item.subCaption" class="text-caption mt-n1 hide-menu">
          {{ item.subCaption }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
    
    <template v-for="(subitem, i) in item.children" :key="i">
      <NavCollapse :item="subitem" v-if="subitem.children" :level="props.level + 1" />
      <NavItem :item="subitem" :level="props.level + 1" v-else></NavItem>
    </template>
  </v-list-group>
</template>

<style scoped>
.nav-group-custom {
  margin-bottom: 4px;
}

.nav-collapse-item {
  transition: all 0.25s;
  color: #444;
  min-height: 48px;
}

.nav-collapse-item:hover {
  background: #fff8f5;
  color: #ee6f38;
}

.nav-collapse-item:hover .icon-wrapper {
  color: #ee6f38;
}

.icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f8f8f8;
  color: #ee6f38;
  transition: all 0.2s;
  margin-right: 12px;
}

.nav-icon {
  font-size: 1.1rem;
}

.nav-title {
  font-weight: 600;
  font-size: 0.95rem;
}

/* Vuetify injects active state for group activators too */
:deep(.v-list-group--active > .v-list-item) {
  color: #ee6f38;
}
</style>
