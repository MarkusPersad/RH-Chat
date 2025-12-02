<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import { createTray } from '../util';
import layout from '../layout/layout.vue';
import { MenuItem } from '../layout';
import { useRouter } from 'vue-router';

const router = useRouter();
const menuItems : Ref<Array<MenuItem>> = ref([
  {
    icon: 'icon-chat',
    tooltip:'消息',
    label:'消息',
    route:"/home",
    action:async ()=>{
      await router.push('/home');
    }
  },
  {
    icon: 'icon-shezhi',
    tooltip:'设置',
    label:'设置',
    route:"/home/setting",
    action:async ()=>{
      // await router.push('/home/setting');
      console.log('设置');
    },
    end:true
  },
  {
    icon: 'icon-lianxiren',
    tooltip:'联系人',
    label:'联系人',
    route:"/home/people",
    action:async ()=>{
      await router.push('/home/people');
    }
  }
])

onMounted(async ()=>{
  await createTray();
})
</script>
<template>
  <layout :menu-items="menuItems">
    <template #content>
      <RouterView />
    </template>
  </layout>
</template>