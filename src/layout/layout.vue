<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Notification } from '../util';
import { MenuItem } from '.';
import { useRoute } from 'vue-router';

// 动态背景粒子
const particles = ref<Array<{x: number, y: number, size: number, speedX: number, speedY: number}>>([]);
const gridPoints = ref<Array<{x: number, y: number, size: number, opacity: number}>>([]);

const props = defineProps<{
  menuItems?:Array<MenuItem>,
  }>();

// 获取当前路由
const route = useRoute();

// 计算当前激活的菜单项
const activeRoute = computed(() => {
  if (!props.menuItems) return '';
  
  // 查找完全匹配的路由
  for (const item of props.menuItems) {
    if (route.path === item.route) {
      return item.route;
    }
  }
  
  // 如果没有完全匹配，查找前缀匹配（适用于子路由）
  for (const item of props.menuItems) {
    if (route.path.startsWith(item.route)) {
      return item.route;
    }
  }
  
  return '';
});

// 全屏状态
const isFullscreen = ref(false);

// 窗口控制函数
const minimizeWindow = async () => {
  try {
    const win = getCurrentWindow();
    await win.minimize();
  } catch (error:any) {
    Notification.sendNotification({
        icon:Notification.ERROR,
        body:error.message || String(error),
    });
  }
};

const closeWindow = async () => {
  try {
    const win = getCurrentWindow();
    await win.hide();
  } catch (error:any) {
    Notification.sendNotification({
        icon:Notification.ERROR,
        body:error.message || String(error),
    });
  }
};

// 添加全屏控制函数
const toggleFullscreen = async () => {
  try {
    const win = getCurrentWindow();
    await win.setFullscreen(!isFullscreen.value);
    isFullscreen.value = !isFullscreen.value;
  } catch (error: any) {
    Notification.sendNotification({
      icon: Notification.ERROR,
      body: error.message || String(error),
    });
  }
};

// 初始化粒子系统
const initParticles = () => {
  // 根据屏幕大小调整粒子数量
  const particleCount = Math.min(80, Math.max(20, Math.floor((window.innerWidth * window.innerHeight) / 12000)));
  for (let i = 0; i < particleCount; i++) {
    particles.value.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5
    });
  }
};

// 初始化网格点
const initGridPoints = () => {
  // 根据屏幕大小调整网格间距
  const baseSpacing = Math.min(40, Math.max(20, window.innerWidth / 30));
  const cols = Math.ceil(window.innerWidth / baseSpacing);
  const rows = Math.ceil(window.innerHeight / baseSpacing);
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      gridPoints.value.push({
        x: i * baseSpacing,
        y: j * baseSpacing,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
  }
};

// 更新粒子位置
const updateParticles = () => {
  particles.value.forEach(particle => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    
    if (particle.x > window.innerWidth || particle.x < 0) {
      particle.speedX *= -1;
    }
    
    if (particle.y > window.innerHeight || particle.y < 0) {
      particle.speedY *= -1;
    }
  });
};

// 粒子动画循环
let animationFrameId: number;
const animateParticles = () => {
  updateParticles();
  animationFrameId = requestAnimationFrame(animateParticles);
};

// 窗口大小调整
const handleResize = () => {
  particles.value = [];
  gridPoints.value = [];
  initParticles();
  initGridPoints();
};

// 组件挂载时
onMounted(async () => {
  initParticles();
  initGridPoints();
  animateParticles();
  window.addEventListener('resize', handleResize);
  
  // 初始化全屏状态
  try {
    const win = getCurrentWindow();
    isFullscreen.value = await win.isFullscreen();
  } catch (error:any) {
    Notification.sendNotification({
      icon: Notification.ERROR,
      body: error.message || String(error),
    });
  }
});

const sortedItems = computed(()=>{
  if (!props.menuItems) return [];

   const normalItems = props.menuItems.filter(item => !item.end);
  const endItems = props.menuItems.filter(item => item.end);
  
  return [...normalItems, ...endItems];
})

// 组件卸载前
onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <!-- 赛博朋克背景 -->
  <div class="fixed inset-0 pointer-events-none z-[-2]">
    <!-- 网格背景 -->
    <div class="absolute inset-0">
      <div 
        v-for="(point, index) in gridPoints" 
        :key="'grid-'+index"
        class="absolute rounded-full bg-cyan-400"
        :style="{
          left: point.x + 'px',
          top: point.y + 'px',
          width: point.size + 'px',
          height: point.size + 'px',
          opacity: point.opacity
        }"
      ></div>
    </div>
    
    <!-- 连接线 -->
    <svg class="absolute inset-0 w-full h-full" style="z-index: -1;">
      <line 
        v-for="(point, index) in gridPoints.slice(0, gridPoints.length - 1)" 
        :key="'line-'+index"
        :x1="point.x" 
        :y1="point.y" 
        :x2="gridPoints[index + 1].x" 
        :y2="gridPoints[index + 1].y" 
        stroke="rgba(0, 229, 255, 0.1)" 
        stroke-width="0.5"
      />
    </svg>
    
    <!-- 浮动粒子 -->
    <div 
      v-for="(particle, index) in particles" 
      :key="'particle-'+index"
      class="absolute rounded-full bg-cyan-400"
      :style="{
        left: particle.x + 'px',
        top: particle.y + 'px',
        width: particle.size + 'px',
        height: particle.size + 'px',
        opacity: 0.7,
        boxShadow: '0 0 ' + particle.size * 3 + 'px rgba(0, 229, 255, 0.8)'
      }"
    ></div>
    
    <!-- 脉冲圆环 -->
    <div class="absolute top-1/4 left-1/4 w-48 h-48 rounded-full border border-cyan-500/10 animate-ping-slow" style="animation-delay: 0s;"></div>
    <div class="absolute top-1/3 right-1/3 w-32 h-32 rounded-full border border-purple-500/10 animate-ping-slow" style="animation-delay: 1s;"></div>
    <div class="absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full border border-cyan-500/10 animate-ping-slow" style="animation-delay: 2s;"></div>
  </div>

  <!-- 扫描线效果 -->
  <div class="fixed inset-0 pointer-events-none z-[-1]">
    <div class="scan-line"></div>
  </div>

  <div class="drawer drawer-open">
    <input id="drawer-switch" class=" drawer-toggle" type="checkbox" />
    <div class="drawer-content">
      <!-- Navbar -->
      <div data-tauri-drag-region class="navbar w-full bg-gray-900/30 backdrop-blur-sm flex items-center justify-between px-4 z-10" style="height: 50px;">
        <div class="flex items-center">
          <label for="drawer-switch" aria-label="打开侧边栏" class="btn btn-square btn-ghost btn-sm text-cyan-300 hover:bg-cyan-500/20 w-8 h-8 min-h-8 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="inline-block w-4 h-4"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
          </label>
        </div>
        <div class="absolute left-1/2 transform -translate-x-1/2">
          <h1 class="glitch text-xl font-bold tracking-wider relative" data-text="RH-CHAT">RH-CHAT</h1>
        </div>
        <div class="flex items-center gap-1 ml-auto">
          <button 
            @click="toggleFullscreen()"
            class="btn btn-square btn-ghost btn-sm text-cyan-300 hover:bg-cyan-500/20 w-8 h-8 min-h-8"
            aria-label="Toggle Fullscreen"
          >
            <!-- 非全屏状态图标（进入全屏） -->
            <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L20.25 3.75M20.25 20.25h-4.5m4.5 0v-4.5m0 4.5L20.25 20.25" />
            </svg>

            <!-- 全屏状态图标（退出全屏） -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.75 6.75v4.5m0-4.5h4.5m-4.5 0L3.75 3.75M6.75 17.25v-4.5m0 4.5h4.5m-4.5 0L3.75 20.25M17.25 6.75h-4.5m4.5 0v4.5m0-4.5L20.25 3.75M17.25 17.25h-4.5m4.5 0v-4.5m0 4.5L20.25 20.25" />
            </svg>
          </button>
          <button 
            @click="minimizeWindow()"
            class="btn btn-square btn-ghost btn-sm text-cyan-300 hover:bg-cyan-500/20 w-8 h-8 min-h-8"
            aria-label="Minimize"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </button>
          <button 
            @click="closeWindow()"
            class="btn btn-square btn-ghost btn-sm text-cyan-300 hover:bg-red-500/20 w-8 h-8 min-h-8"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="p-4 page-content pt-14">
        <slot name="content"/>
      </div>
    </div>
    
    <div class="drawer-side is-drawer-close:overflow-visible">
      <label for="drawer-switch" aria-label="关闭侧边栏" class=" drawer-overlay"></label>
      <div class="flex min-h-full flex-col items-start bg-gray-900/40 backdrop-blur-xl border-r border-cyan-500/30 is-drawer-close:w-14 is-drawer-open:w-32 cyber-sidebar relative">
        <!-- 装饰性边框 -->
        <div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0"></div>
        
        <ul class="menu w-full grow pt-4 relative z-10">
          <template v-if="!props.menuItems">
            <!-- List item -->
            <li>
              <button class="is-drawer-close:tooltip is-drawer-close:tooltip-right cyber-menu-item group" data-tip="主页">
                <!-- Home icon -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-5 group-hover:stroke-cyan-400 group-hover:scale-110 transition-transform duration-200"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                <span class="is-drawer-close:hidden">主页</span>
              </button>
            </li>

            <!-- List item -->
            <li>
              <button class="is-drawer-close:tooltip is-drawer-close:tooltip-right cyber-menu-item group" data-tip="设置">
                <!-- Settings icon -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-5 group-hover:stroke-cyan-400 group-hover:scale-110 transition-transform duration-200"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
                <span class="is-drawer-close:hidden">设置</span>
              </button>
            </li>
          </template>
          <template v-else>
            <li v-for="menuItem in sortedItems" :key="menuItem.route" :class="{'mt-auto': menuItem.end}">
              <button 
                class="is-drawer-close:tooltip is-drawer-close:tooltip-right cyber-menu-item" 
                :data-tip="menuItem.tooltip" 
                @click="menuItem.action"
                :class="{ 'bg-cyan-500/30 border-r-2 border-cyan-400': activeRoute === menuItem.route }"
              >
                <div :class="[
                  'iconfont',
                  'my-1.5 inline-block size-5 group-hover:stroke-cyan-400 group-hover:scale-110 transition-transform duration-200',
                  menuItem.icon,
                  activeRoute === menuItem.route ? 'text-cyan-400 font-bold' : ''
                ]"></div>
                <span 
                  class="is-drawer-close:hidden" 
                  :class="{ 'text-cyan-400 font-bold': activeRoute === menuItem.route }"
                >
                  {{ menuItem.label }}
                </span>
              </button>
            </li>
          </template>
        </ul>
        
        <!-- 底部装饰 -->
        <div class="absolute bottom-4 left-2 w-2 h-2 rounded-full bg-cyan-400 opacity-70 animate-pulse"></div>
        <div class="absolute bottom-8 right-2 w-1 h-1 rounded-full bg-purple-300 opacity-50 animate-ping"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 添加科幻风格动画 */
@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  to {
    transform: translate(0);
  }
}

.glitch {
  color: #00e5ff;
  position: relative;
  animation: glitch 5s infinite;
  text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  left: 2px;
  text-shadow: -2px 0 #ff00c1;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim 5s infinite linear alternate-reverse;
}

.glitch::after {
  left: -2px;
  text-shadow: -2px 0 #00fff9;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim2 5s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
  0% {
    clip: rect(32px, 9999px, 28px, 0);
  }
  5% {
    clip: rect(13px, 9999px, 37px, 0);
  }
  10% {
    clip: rect(40px, 9999px, 39px, 0);
  }
  15% {
    clip: rect(14px, 9999px, 93px, 0);
  }
  20% {
    clip: rect(99px, 9999px, 35px, 0);
  }
  25% {
    clip: rect(36px, 9999px, 90px, 0);
  }
  30% {
    clip: rect(29px, 9999px, 20px, 0);
  }
  35% {
    clip: rect(17px, 9999px, 27px, 0);
  }
  40% {
    clip: rect(81px, 9999px, 2px, 0);
  }
  45% {
    clip: rect(83px, 9999px, 40px, 0);
  }
  50% {
    clip: rect(96px, 9999px, 92px, 0);
  }
  55% {
    clip: rect(61px, 9999px, 57px, 0);
  }
  60% {
    clip: rect(71px, 9999px, 50px, 0);
  }
  65% {
    clip: rect(40px, 9999px, 44px, 0);
  }
  70% {
    clip: rect(9px, 9999px, 15px, 0);
  }
  75% {
    clip: rect(48px, 9999px, 24px, 0);
  }
  80% {
    clip: rect(45px, 9999px, 20px, 0);
  }
  85% {
    clip: rect(25px, 9999px, 100px, 0);
  }
  90% {
    clip: rect(30px, 9999px, 44px, 0);
  }
  95% {
    clip: rect(5px, 9999px, 79px, 0);
  }
  100% {
    clip: rect(97px, 9999px, 96px, 0);
  }
}

@keyframes glitch-anim2 {
  0% {
    clip: rect(65px, 9999px, 100px, 0);
  }
  5% {
    clip: rect(52px, 9999px, 74px, 0);
  }
  10% {
    clip: rect(79px, 9999px, 85px, 0);
  }
  15% {
    clip: rect(75px, 9999px, 5px, 0);
  }
  20% {
    clip: rect(67px, 9999px, 61px, 0);
  }
  25% {
    clip: rect(14px, 9999px, 79px, 0);
  }
  30% {
    clip: rect(1px, 9999px, 66px, 0);
  }
  35% {
    clip: rect(86px, 9999px, 30px, 0);
  }
  40% {
    clip: rect(23px, 9999px, 98px, 0);
  }
  45% {
    clip: rect(85px, 9999px, 72px, 0);
  }
  50% {
    clip: rect(71px, 9999px, 75px, 0);
  }
  55% {
    clip: rect(20px, 9999px, 24px, 0);
  }
  60% {
    clip: rect(34px, 9999px, 46px, 0);
  }
  65% {
    clip: rect(44px, 9999px, 64px, 0);
  }
  70% {
    clip: rect(34px, 9999px, 69px, 0);
  }
  75% {
    clip: rect(39px, 9999px, 59px, 0);
  }
  80% {
    clip: rect(2px, 9999px, 39px, 0);
  }
  85% {
    clip: rect(100px, 9999px, 89px, 0);
  }
  90% {
    clip: rect(18px, 9999px, 5px, 0);
  }
  95% {
    clip: rect(40px, 9999px, 89px, 0);
  }
  100% {
    clip: rect(92px, 9999px, 98px, 0);
  }
}

.cyber-title {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: bold;
}

.cyber-nav {
  position: relative;
}

.cyber-nav::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, #00e5ff, transparent);
}

.cyber-nav-item {
  position: relative;
  padding: 0.5rem 1rem;
}

.cyber-nav-item::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(to right, transparent, #00e5ff, transparent);
  transition: width 0.3s ease;
}

.cyber-sidebar {
  position: relative;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.1);
  backdrop-filter: blur(20px);
}

/* 优化后的菜单项样式 */
.cyber-menu-item {
  position: relative;
  margin: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #e0f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.5rem;
  overflow: hidden;
}

/* 图标过渡效果 */
.cyber-menu-item svg {
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 0 transparent);
}

/* 展开模式下的hover效果 */
.drawer-side:not(.is-drawer-close) .cyber-menu-item:hover {
  color: #00e5ff;
  background: rgba(0, 229, 255, 0.15);
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
  transform: translateY(-2px);
}

/* 仅图标模式的hover效果 */
.drawer-side.is-drawer-close .cyber-menu-item:hover {
  background: rgba(0, 229, 255, 0.1);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.25);
  transform: scale(1.05);
}

.drawer-side.is-drawer-close .cyber-menu-item:hover svg {
  filter: drop-shadow(0 0 8px #00e5ff);
  transform: scale(1.15);
}

/* 展开模式的垂直线条动画 */
.drawer-side:not(.is-drawer-close) .cyber-menu-item::before,
.drawer-side:not(.is-drawer-close) .cyber-menu-item::after {
  content: "";
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, #00e5ff, transparent);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-side:not(.is-drawer-close) .cyber-menu-item::before {
  left: 0;
  transform: scaleY(0);
  transform-origin: top;
}

.drawer-side:not(.is-drawer-close) .cyber-menu-item::after {
  right: 0;
  transform: scaleY(0);
  transform-origin: bottom;
}

.drawer-side:not(.is-drawer-close) .cyber-menu-item:hover::before,
.drawer-side:not(.is-drawer-close) .cyber-menu-item:hover::after {
  transform: scaleY(1);
}

/* 紧凑模式隐藏垂直线条 */
.drawer-side.is-drawer-close .cyber-menu-item::before,
.drawer-side.is-drawer-close .cyber-menu-item::after {
  display: none;
}

.drawer-side.is-drawer-close .cyber-menu-item:hover::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(0, 229, 255, 0.2) 0%, transparent 70%);
  z-index: -1;
  animation: pulse-bg 0.6s ease-out;
}

@keyframes pulse-bg {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.page-content {
  min-height: calc(100vh);
  background: linear-gradient(to bottom, rgba(17, 24, 39, 0.7), rgba(17, 24, 39, 0.4));
}

/* 慢速脉冲动画 */
@keyframes ping-slow {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  75%, 100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.animate-ping-slow {
  animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* 输入角落装饰 */
.input-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  border-color: #00e5ff;
}

.input-corner-tl {
  top: 0;
  left: 0;
  border-top: 2px solid;
  border-left: 2px solid;
}

.input-corner-tr {
  top: 0;
  right: 0;
  border-top: 2px solid;
  border-right: 2px solid;
}

.input-corner-bl {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid;
  border-left: 2px solid;
}

.input-corner-br {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid;
  border-right: 2px solid;
}

/* 扫描线动画 */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: rgba(0, 229, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
  animation: scan 4s linear infinite;
  z-index: 999;
}

@keyframes scan {
  0% {
    top: 0%;
  }
  100% {
    top: 100%;
  }
}
</style>