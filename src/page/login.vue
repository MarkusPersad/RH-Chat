<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { Http } from '../util';
import { Notification } from '../util';
import { API } from '../assets/default.json';
import { useRouter } from 'vue-router';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { platform } from '@tauri-apps/plugin-os';
import { LocalStore } from '../util';

// 响应式状态，用于切换登录/注册模式
const isLogin = ref(true)
const router = useRouter();

// 表单数据
const form = reactive({
  username: '',
  email: '',
  password: ''
})

// 动态背景粒子
const particles = ref<Array<{x: number, y: number, size: number, speedX: number, speedY: number}>>([])

// 网格背景点
const gridPoints = ref<Array<{x: number, y: number, size: number, opacity: number}>>([])

// 初始化粒子系统
const initParticles = () => {
  // 根据屏幕大小调整粒子数量
  const particleCount = Math.min(100, Math.max(30, Math.floor((window.innerWidth * window.innerHeight) / 10000)))
  for (let i = 0; i < particleCount; i++) {
    particles.value.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5
    })
  }
}

// 初始化网格点
const initGridPoints = () => {
  // 根据屏幕大小调整网格间距
  const baseSpacing = Math.min(40, Math.max(20, window.innerWidth / 25))
  const cols = Math.ceil(window.innerWidth / baseSpacing)
  const rows = Math.ceil(window.innerHeight / baseSpacing)
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      gridPoints.value.push({
        x: i * baseSpacing,
        y: j * baseSpacing,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1
      })
    }
  }
}

// 更新粒子位置
const updateParticles = () => {
  particles.value.forEach(particle => {
    particle.x += particle.speedX
    particle.y += particle.speedY
    
    if (particle.x > window.innerWidth || particle.x < 0) {
      particle.speedX *= -1
    }
    
    if (particle.y > window.innerHeight || particle.y < 0) {
      particle.speedY *= -1
    }
  })
}

// 粒子动画循环
let animationFrameId: number
const animateParticles = () => {
  updateParticles()
  animationFrameId = requestAnimationFrame(animateParticles)
}

// 窗口大小调整
const handleResize = () => {
  // 重新初始化粒子以适应新尺寸
  particles.value = []
  gridPoints.value = []
  initParticles()
  initGridPoints()
}

// 组件挂载时
onMounted(() => {
  initParticles()
  initGridPoints()
  animateParticles()
  window.addEventListener('resize', handleResize)
})

// 组件卸载前
onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', handleResize)
})

// 切换登录/注册模式
const toggleMode = () => {
  isLogin.value = !isLogin.value
  // 清空表单数据
  form.username = ''
  form.email = ''
  form.password = ''
}

// 提交表单
const handleSubmit = async () => {
  if (isLogin.value) {
    try{
      let response = await Http.HttpInstance().request({
      url: API.LOGIN,
      method:"POST",
      data:{
        email:form.email,
        password:form.password
      }
    });
    const data = await response.json();
    if(data.code !== 200){
      throw new Error(data.message);
    }
    Http.HttpInstance().setHeader('Authorization',data.data.token);
    await LocalStore.setValue(data.data.userName,data.data);
    router.push('/home');
    } catch(error:any) {
      Notification.sendNotification({
        icon:Notification.ERROR,
        body:error.message || String(error),
      })
    }
  } else {
    try{
      let response =  await Http.HttpInstance().request({
        url:API.REGISTER,
        method:"POST",
        data:{
          userName:form.username,
          email:form.email,
          password:form.password
        }
      });
      const data = await response.json();
      if(data.code !== 200){
        throw new Error(data.message);
      }
      isLogin.value = true;
      Notification.sendNotification({
        icon:Notification.SUCCESS,
        body:"注册成功，请登录！",
      })
    } catch(error:any) {
      Notification.sendNotification({
        icon:Notification.ERROR,
        body:error.message || String(error),
      })
    }
  }
}

// 最小化窗口
const minimizeWindow = async () => {
  await getCurrentWindow().minimize();
}

// 关闭窗口
const closeWindow = async () => {
  await getCurrentWindow().close();
}
</script>

<template>
  <!-- Navbar -->
  <div v-if="!(platform() === 'android' || platform() === 'ios')" data-tauri-drag-region class="navbar fixed top-0 left-0 right-0 z-50 bg-gray-900/30 backdrop-blur-sm flex items-center justify-between px-4" style="height: 50px;">
    <div class="flex-1"></div>
    <div class="flex-1 flex justify-center">
      <h1 class="glitch text-2xl md:text-3xl font-bold tracking-wider relative" data-text="RH-CHAT">RH-CHAT</h1>
    </div>
    <div class="flex-1 flex justify-end gap-1">
      <button 
        @click="minimizeWindow"
        class="btn btn-square btn-ghost btn-sm text-cyan-300 hover:bg-cyan-500/20 w-8 h-8 min-h-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
        </svg>
      </button>
      <button 
        @click="closeWindow"
        class="btn btn-square btn-ghost btn-sm text-cyan-300 hover:bg-red-500/20 w-8 h-8 min-h-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </div>

  <!-- 赛博朋克背景 -->
  <div class="fixed inset-0">
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
    <div class="absolute top-1/4 left-1/4 w-1/4 h-1/4 rounded-full border border-cyan-500/20 animate-ping-slow" style="animation-delay: 0s;"></div>
    <div class="absolute top-1/3 right-1/3 w-1/6 h-1/6 rounded-full border border-purple-500/20 animate-ping-slow" style="animation-delay: 1s;"></div>
    <div class="absolute bottom-1/4 left-1/3 w-1/5 h-1/5 rounded-full border border-cyan-500/20 animate-ping-slow" style="animation-delay: 2s;"></div>
  </div>

  <!-- 扫描线效果 -->
  <div class="fixed inset-0 pointer-events-none">
    <div class="scan-line"></div>
  </div>

  <div class="min-h-screen bg-linear-to-br from-gray-900 via-black to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden pt-14">
    <div class="w-full max-w-md relative z-10 mt-2">
      <div class="text-center mb-6">
        <p class="text-gray-400 mt-2 text-sm tracking-widest cyber-panel">
          {{ isLogin ? '系统认证' : '用户注册' }}
        </p>
      </div>

      <!-- 表单卡片 -->
      <div class="bg-gray-800/20 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6 md:p-8 shadow-2xl shadow-cyan-500/10 relative overflow-hidden cyber-frame">
        <!-- 装饰性边框 -->
        <div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0"></div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-purple-500/0 via-purple-500 to-purple-500/0"></div>
        
        <!-- 表单 -->
        <form @submit.prevent="handleSubmit">
          <!-- 用户名（仅注册时显示） -->
          <div v-if="!isLogin" class="mb-5 cyber-input-group">
            <label class="block text-cyan-300 text-xs uppercase tracking-widest mb-2">用户名</label>
            <div class="relative">
              <input
                v-model="form.username"
                type="text"
                class="w-full bg-gray-900/50 border border-cyan-500/30 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder-gray-600 cyber-input"
                placeholder="请输入用户名"
                required
              />
              <div class="input-corner input-corner-tl"></div>
              <div class="input-corner input-corner-tr"></div>
              <div class="input-corner input-corner-bl"></div>
              <div class="input-corner input-corner-br"></div>
            </div>
          </div>

          <!-- 邮箱 -->
          <div class="mb-5 cyber-input-group">
            <label class="block text-cyan-300 text-xs uppercase tracking-widest mb-2">邮箱</label>
            <div class="relative">
              <input
                v-model="form.email"
                type="email"
                class="w-full bg-gray-900/50 border border-cyan-500/30 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder-gray-600 cyber-input"
                placeholder="请输入邮箱"
                required
              />
              <div class="input-corner input-corner-tl"></div>
              <div class="input-corner input-corner-tr"></div>
              <div class="input-corner input-corner-bl"></div>
              <div class="input-corner input-corner-br"></div>
            </div>
          </div>

          <!-- 密码 -->
          <div class="mb-6 cyber-input-group">
            <label class="block text-cyan-300 text-xs uppercase tracking-widest mb-2">密码</label>
            <div class="relative">
              <input
                v-model="form.password"
                type="password"
                class="w-full bg-gray-900/50 border border-cyan-500/30 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder-gray-600 cyber-input"
                placeholder="请输入密码"
                required
              />
              <div class="input-corner input-corner-tl"></div>
              <div class="input-corner input-corner-tr"></div>
              <div class="input-corner input-corner-bl"></div>
              <div class="input-corner input-corner-br"></div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            class="w-full bg-linear-to-r from-cyan-600 to-purple-700 hover:from-cyan-500 hover:to-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 shadow-lg shadow-cyan-500/20 cyber-button relative"
          >
            <span class="relative z-10">{{ isLogin ? '进入系统' : '创建账户' }}</span>
            <div class="button-edge button-edge-top"></div>
            <div class="button-edge button-edge-bottom"></div>
          </button>
        </form>

        <!-- 底部信息 -->
        <div class="mt-6 text-center text-xs text-gray-400 tracking-widest cyber-panel ">
          <p v-if="isLogin">新用户？<button @click="toggleMode" class="text-cyan-400 hover:text-cyan-300 underline cyber-link">立即注册</button></p>
          <p v-else>已有账户？<button @click="toggleMode" class="text-cyan-400 hover:text-cyan-300 underline cyber-link">在此登录</button></p>
        </div>
      </div>

      <!-- 装饰性元素 -->
      <div class="absolute -top-10 -left-10 w-20 h-20 md:w-40 md:h-40 border border-cyan-500/20 rounded-full"></div>
      <div class="absolute -bottom-10 -right-10 w-20 h-20 md:w-40 md:h-40 border border-purple-500/20 rounded-full"></div>
      <div class="absolute top-10 left-10 w-1 h-1 md:w-2 md:h-2 bg-cyan-400 rounded-full opacity-70 animate-pulse"></div>
      <div class="absolute bottom-20 right-16 w-1 h-1 bg-purple-300 rounded-full opacity-50 animate-ping"></div>
      <div class="absolute top-1/3 right-10 w-16 md:w-24 h-px bg-linear-to-r from-transparent via-cyan-500 to-transparent"></div>
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
    transform: translate(-3px, 3px);
  }
  40% {
    transform: translate(-3px, -3px);
  }
  60% {
    transform: translate(3px, 3px);
  }
  80% {
    transform: translate(3px, -3px);
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

.cyber-panel {
  background: transparent;
  border: none;
  padding: 8px 16px;
  border-radius: 0;
  backdrop-filter: none;
}

.cyber-frame::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid transparent;
  border-image: linear-gradient(
    to bottom,
    rgba(0, 229, 255, 0.2),
    rgba(0, 0, 0, 0)
  ) 1;
  border-top: none;
  border-bottom: none;
  z-index: -1;
}

.cyber-input {
  position: relative;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.cyber-input:focus {
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
  border-color: rgba(0, 229, 255, 0.7);
}

.input-corner {
  position: absolute;
  width: 8px;
  height: 8px;
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

.cyber-button {
  overflow: hidden;
  border-radius: 4px;
}

.cyber-button:hover {
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
}

.button-edge {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, transparent, #00e5ff, transparent);
}

.button-edge-top {
  top: 0;
}

.button-edge-bottom {
  bottom: 0;
}

.cyber-link {
  position: relative;
  transition: all 0.3s ease;
}

.cyber-link::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 0;
  height: 1px;
  background: #00e5ff;
  transition: width 0.3s ease;
}

.cyber-link:hover::after {
  width: 100%;
}

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
</style>