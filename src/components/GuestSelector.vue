<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: { adults: number, children: number, rooms: number, pets: boolean }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { adults: number, children: number, rooms: number, pets: boolean }): void
  (e: 'close'): void
}>()

const adults = ref(props.modelValue.adults)
const children = ref(props.modelValue.children)
const rooms = ref(props.modelValue.rooms)
const pets = ref(props.modelValue.pets)

const updateValue = () => {
  emit('update:modelValue', {
    adults: adults.value,
    children: children.value,
    rooms: rooms.value,
    pets: pets.value
  })
}

const increment = (type: 'adults' | 'children' | 'rooms') => {
  if (type === 'adults') adults.value++
  if (type === 'children') children.value++
  if (type === 'rooms') rooms.value++
  updateValue()
}

const decrement = (type: 'adults' | 'children' | 'rooms') => {
  if (type === 'adults' && adults.value > 1) adults.value--
  if (type === 'children' && children.value > 0) children.value--
  if (type === 'rooms' && rooms.value > 1) rooms.value--
  updateValue()
}

const togglePets = () => {
  pets.value = !pets.value
  updateValue()
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="guest-selector-popover">
    <div class="row">
      <div class="label">Adultos</div>
      <div class="controls">
        <button class="control-btn" :disabled="adults <= 1" @click="decrement('adults')">−</button>
        <span class="value">{{ adults }}</span>
        <button class="control-btn" @click="increment('adults')">+</button>
      </div>
    </div>
    
    <div class="row">
      <div class="label">Niños</div>
      <div class="controls">
        <button class="control-btn" :disabled="children <= 0" @click="decrement('children')">−</button>
        <span class="value">{{ children }}</span>
        <button class="control-btn" @click="increment('children')">+</button>
      </div>
    </div>

    <div class="row">
      <div class="label">Habitaciones</div>
      <div class="controls">
        <button class="control-btn" :disabled="rooms <= 1" @click="decrement('rooms')">−</button>
        <span class="value">{{ rooms }}</span>
        <button class="control-btn" @click="increment('rooms')">+</button>
      </div>
    </div>

    <div class="divider"></div>

    <div class="pets-section">
      <div class="pets-row">
        <span>¿Viajas con mascotas?</span>
        <div class="toggle-switch" :class="{ active: pets }" @click="togglePets">
          <div class="toggle-knob"></div>
        </div>
      </div>
      <p class="pets-info">Los animales de servicio no se consideran mascotas.</p>
      <a href="#" class="pets-link" @click.prevent>Más info sobre viajar con animales de servicio</a>
    </div>

    <button class="btn-listo" @click="handleClose">Listo</button>
  </div>
</template>

<style scoped>
.guest-selector-popover {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 24px;
  width: 340px;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #333;
  border: 1px solid #e0e0e0;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.label {
  font-weight: 600;
  font-size: 1rem;
}

.controls {
  display: flex;
  align-items: center;
  border: 1px solid #b0b0b0;
  border-radius: 6px;
  overflow: hidden;
  height: 40px;
}

.control-btn {
  background: white;
  border: none;
  width: 40px;
  height: 100%;
  font-size: 1.2rem;
  color: var(--color-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.control-btn:hover:not(:disabled) {
  background: #f0f8ff;
}

.value {
  width: 40px;
  text-align: center;
  font-weight: 500;
  font-size: 1rem;
}

.divider {
  height: 1px;
  background-color: #eee;
  margin: 20px 0;
}

.pets-section {
  margin-bottom: 24px;
}

.pets-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 400;
  font-size: 1rem;
  margin-bottom: 12px;
}

.toggle-switch {
  width: 48px;
  height: 24px;
  background-color: #888;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-switch.active {
  background-color: var(--color-primary);
}

.toggle-knob {
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.toggle-switch.active .toggle-knob {
  transform: translateX(24px);
}

.pets-info {
  font-size: 0.85rem;
  color: #333;
  margin-bottom: 4px;
}

.pets-link {
  font-size: 0.85rem;
  color: var(--color-primary);
  text-decoration: none;
}

.pets-link:hover {
  text-decoration: underline;
}

.btn-listo {
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-listo:hover {
  background: #f0f8ff;
}
</style>
