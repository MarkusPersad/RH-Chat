<script setup lang="ts">
import { reactive, computed } from 'vue';

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
}

interface Props {
  fields: FormField[];
  submitText: string;
  isLogin: boolean;
  toggleText: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['submit', 'toggle']);

const form = reactive<Record<string, string>>({});

// 初始化表单字段
props.fields.forEach(field => {
  form[field.name] = '';
});

const handleSubmit = () => {
  emit('submit', { ...form });
};

const handleToggle = () => {
  emit('toggle');
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div v-for="field in fields" :key="field.name" class="mb-5 cyber-input-group">
      <label class="block text-cyan-300 text-xs uppercase tracking-widest mb-2">{{ field.label }}</label>
      <div class="relative">
        <input
          v-model="form[field.name]"
          :type="field.type"
          class="w-full bg-gray-900/50 border border-cyan-500/30 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder-gray-600 cyber-input"
          :placeholder="field.placeholder"
          :required="field.required"
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
      <span class="relative z-10">{{ submitText }}</span>
      <div class="button-edge button-edge-top"></div>
      <div class="button-edge button-edge-bottom"></div>
    </button>
  </form>

  <!-- 底部信息 -->
  <div class="mt-6 text-center text-xs text-gray-400 tracking-widest cyber-panel">
    <p><slot name="footer" :toggle="handleToggle"></slot></p>
  </div>
</template>

<style scoped>
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

.cyber-panel {
  background: transparent;
  border: none;
  padding: 8px 16px;
  border-radius: 0;
  backdrop-filter: none;
}
</style>