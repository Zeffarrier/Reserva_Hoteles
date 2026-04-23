<script setup lang="ts">
import SvgIcon from './SvgIcon.vue'
import { onMounted, onUnmounted } from 'vue'

defineProps<{
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
  showCancel?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="dialog-overlay" @click.self="emit('cancel')">
      <div class="dialog-container animate-fade-in">
        <div class="dialog-header">
          <div class="icon-circle" :class="{ 'danger': isDanger }">
            <SvgIcon :name="isDanger ? 'close' : 'info'" :size="24" />
          </div>
          <h3>{{ title }}</h3>
        </div>
        
        <div class="dialog-body">
          <p v-html="message"></p>
        </div>

        <div class="dialog-footer">
          <button v-if="showCancel" class="btn btn-secondary" @click="emit('cancel')">
            {{ cancelText || 'Cancelar' }}
          </button>
          <button :class="isDanger ? 'btn-danger-action' : 'btn btn-primary'" @click="emit('confirm')">
            {{ confirmText || 'Aceptar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

.dialog-container {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 32px;
  text-align: center;
}

.dialog-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle.danger {
  background-color: #fee2e2;
  color: #dc2626;
}

.dialog-header h3 {
  font-size: 1.25rem;
  color: var(--color-text);
  margin: 0;
}

.dialog-body p {
  color: var(--color-text-light);
  line-height: 1.5;
  margin-bottom: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.dialog-footer button {
  min-width: 120px;
}

/* Reusing global styles or defining local ones if needed */
.btn-danger-action {
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger-action:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
}
</style>
