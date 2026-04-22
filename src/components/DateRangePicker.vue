<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue?: { start: Date | null, end: Date | null }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { start: Date | null, end: Date | null }): void
  (e: 'close'): void
}>()

// Current viewing month/year (left calendar)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

// Next month viewing (right calendar)
const nextMonthDate = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 1)
})

const hoverDate = ref<Date | null>(null)
const isSelectingEnd = ref(false)

const startDate = ref<Date | null>(props.modelValue?.start || null)
const endDate = ref<Date | null>(props.modelValue?.end || null)

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    startDate.value = newVal.start
    endDate.value = newVal.end
  }
}, { deep: true })

const daysOfWeek = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']

// Helper functions for calendar generation
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

const generateCalendarDays = (year: number, month: number) => {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const days = []

  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: null, isEmpty: true })
  }

  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    // Clear time for precise comparison
    date.setHours(0, 0, 0, 0)
    days.push({ date, isEmpty: false, dayNum: i })
  }

  return days
}

const leftCalendarDays = computed(() => generateCalendarDays(currentYear.value, currentMonth.value))
const rightCalendarDays = computed(() => generateCalendarDays(nextMonthDate.value.getFullYear(), nextMonthDate.value.getMonth()))

const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const leftMonthName = computed(() => `${monthNames[currentMonth.value]} ${currentYear.value}`)
const rightMonthName = computed(() => `${monthNames[nextMonthDate.value.getMonth()]} ${nextMonthDate.value.getFullYear()}`)

const changeMonth = (delta: number) => {
  const newDate = new Date(currentYear.value, currentMonth.value + delta, 1)
  currentMonth.value = newDate.getMonth()
  currentYear.value = newDate.getFullYear()
}

const onDateClick = (date: Date) => {
  if (!isSelectingEnd.value) {
    // Start a new selection
    startDate.value = date
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    endDate.value = nextDay
    isSelectingEnd.value = true
    emit('update:modelValue', { start: startDate.value, end: endDate.value })
  } else {
    // Currently selecting the end date
    if (date.getTime() === startDate.value?.getTime()) {
      // Clicked the exact same start date. End date is already start+1. Finish.
      isSelectingEnd.value = false
      setTimeout(() => emit('close'), 300)
    } else if (date < startDate.value!) {
      // Clicked before start date. Reset start date.
      startDate.value = date
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      endDate.value = nextDay
      isSelectingEnd.value = true
      emit('update:modelValue', { start: startDate.value, end: endDate.value })
    } else {
      // Clicked after start date. Confirm end date.
      endDate.value = date
      isSelectingEnd.value = false
      emit('update:modelValue', { start: startDate.value, end: endDate.value })
      setTimeout(() => emit('close'), 300)
    }
  }
}

const onDateHover = (date: Date) => {
  if (isSelectingEnd.value && startDate.value) {
    hoverDate.value = date
  }
}

const onMouseLeave = () => {
  hoverDate.value = null
}

// Styling classes
const visualEndDate = computed(() => {
  if (isSelectingEnd.value && hoverDate.value && startDate.value && hoverDate.value > startDate.value) {
    return hoverDate.value
  }
  return endDate.value
})

const isSelectedStart = (date: Date) => startDate.value?.getTime() === date.getTime()
const isSelectedEnd = (date: Date) => visualEndDate.value?.getTime() === date.getTime()
const isPast = (date: Date) => {
  const today = new Date()
  today.setHours(0,0,0,0)
  return date < today
}

const isInRange = (date: Date) => {
  if (!startDate.value) return false
  
  const vEnd = visualEndDate.value
  if (vEnd) {
    return date > startDate.value && date < vEnd
  }
  
  return false
}

const getDayClasses = (day: any) => {
  if (day.isEmpty) return 'day-empty'
  
  const isPastDate = isPast(day.date)
  const isStart = isSelectedStart(day.date)
  const isEnd = isSelectedEnd(day.date)
  const inRange = isInRange(day.date)
  
  return {
    'day-cell': true,
    'is-past': isPastDate,
    'is-selected-start': isStart,
    'is-selected-end': isEnd,
    'is-selected': isStart || isEnd,
    'is-in-range': inRange,
    'is-selectable': !isPastDate
  }
}
</script>

<template>
  <div class="date-picker-container" @mouseleave="onMouseLeave">

    <!-- Calendars -->
    <div class="calendars-wrapper">
      <!-- Left Calendar -->
      <div class="calendar-pane">
        <div class="calendar-header">
          <button class="nav-btn" @click="changeMonth(-1)">‹</button>
          <span class="month-title">{{ leftMonthName }}</span>
          <div class="nav-placeholder"></div>
        </div>
        
        <div class="days-of-week">
          <span v-for="day in daysOfWeek" :key="day">{{ day }}</span>
        </div>
        
        <div class="days-grid">
          <div 
            v-for="(day, index) in leftCalendarDays" 
            :key="`left-${index}`"
            :class="getDayClasses(day)"
            @click="!day.isEmpty && !isPast(day.date) ? onDateClick(day.date) : null"
            @mouseenter="!day.isEmpty && !isPast(day.date) ? onDateHover(day.date) : null"
          >
            <span v-if="!day.isEmpty">{{ day.dayNum }}</span>
          </div>
        </div>
      </div>

      <!-- Right Calendar -->
      <div class="calendar-pane">
        <div class="calendar-header">
          <div class="nav-placeholder"></div>
          <span class="month-title">{{ rightMonthName }}</span>
          <button class="nav-btn" @click="changeMonth(1)">›</button>
        </div>
        
        <div class="days-of-week">
          <span v-for="day in daysOfWeek" :key="day">{{ day }}</span>
        </div>
        
        <div class="days-grid">
          <div 
            v-for="(day, index) in rightCalendarDays" 
            :key="`right-${index}`"
            :class="getDayClasses(day)"
            @click="!day.isEmpty && !isPast(day.date) ? onDateClick(day.date) : null"
            @mouseenter="!day.isEmpty && !isPast(day.date) ? onDateHover(day.date) : null"
          >
            <span v-if="!day.isEmpty">{{ day.dayNum }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-picker-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 0;
  width: 700px;
  max-width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}


.calendars-wrapper {
  display: flex;
  flex-wrap: wrap;
  padding: 24px;
  gap: 24px;
}

.calendar-pane {
  flex: 1;
  min-width: 200px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.month-title {
  font-weight: 700;
  font-size: 1rem;
  text-transform: capitalize;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  line-height: 1;
}

.nav-btn:hover {
  background-color: #f0f0f0;
}

.nav-placeholder {
  width: 32px;
}

.days-of-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 12px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
}

.day-cell.is-selectable:hover:not(.is-selected) {
  background-color: #f0f0f0;
  border-radius: 50%;
}

.day-cell.is-past {
  color: #ccc;
  cursor: not-allowed;
}

.day-cell.is-selected {
  background-color: var(--color-primary);
  color: white;
  font-weight: bold;
}

.day-cell.is-selected-start {
  border-top-left-radius: 50%;
  border-bottom-left-radius: 50%;
}

.day-cell.is-selected-end {
  border-top-right-radius: 50%;
  border-bottom-right-radius: 50%;
}

.day-cell.is-in-range {
  background-color: #f0f0f0;
}

/* Connect the blue dots visually if in range */
.day-cell.is-selected-start.is-in-range::after {
  content: '';
  position: absolute;
  top: 0;
  right: -50%;
  width: 50%;
  height: 100%;
  background-color: #f0f0f0;
  z-index: -1;
}

.day-cell.is-selected-end.is-in-range::before {
  content: '';
  position: absolute;
  top: 0;
  left: -50%;
  width: 50%;
  height: 100%;
  background-color: #f0f0f0;
  z-index: -1;
}
</style>
