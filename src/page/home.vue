<script setup lang="ts">
import { onMounted } from 'vue';
import { createTray } from '../util';
import layout from '../layout/layout.vue';

onMounted(async ()=>{
  await createTray();
})
</script>
<template>
  <layout>
    <template #content>
      <RouterView />
    </template>
  </layout>
</template>