<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useHotelStore } from './store/hotelStore'
import SvgIcon from './components/SvgIcon.vue'
import { computed } from 'vue'

const { state, logout } = useHotelStore()
const router = useRouter()

const currentUser = computed(() => state.currentUser)

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-wrapper">
    <nav class="main-nav">
      <div class="nav-brand">LuxeStay</div>
      <div class="nav-links">
        <RouterLink to="/" class="nav-link">Home</RouterLink>
        
        <!-- Only for Receptionist or Admin -->
        <RouterLink 
          v-if="currentUser && (currentUser.role === 'receptionist' || currentUser.role === 'admin')" 
          to="/receptionist" 
          class="nav-link"
        >
          Recepción
        </RouterLink>
        
        <!-- Only for Admin -->
        <RouterLink 
          v-if="currentUser && currentUser.role === 'admin'" 
          to="/admin" 
          class="nav-link"
        >
          Admin
        </RouterLink>
      </div>

      <div class="auth-links">
        <template v-if="currentUser">
          <RouterLink to="/profile" class="nav-link user-profile-link">
            <SvgIcon name="user" :size="16" /> {{ currentUser.name }}
          </RouterLink>
          <button @click="handleLogout" class="btn-logout">Salir</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="nav-link">Iniciar Sesión</RouterLink>
          <RouterLink to="/register" class="btn btn-primary btn-sm">Registrarse</RouterLink>
        </template>
      </div>
    </nav>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
/* Base styles will be in src/assets/styles.css */
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-nav {
  background: var(--color-surface);
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.5px;
  margin-right: var(--spacing-xl);
}

.nav-links {
  display: flex;
  gap: var(--spacing-md);
  flex: 1;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.nav-link {
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: var(--color-background);
  color: var(--color-primary);
}

.nav-link.router-link-active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.user-profile-link {
  color: var(--color-primary);
  font-weight: 600;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: var(--font-size-sm);
}

.btn-logout {
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  font-weight: 500;
  font-family: inherit;
  font-size: var(--font-size-md);
}

.btn-logout:hover {
  color: var(--color-danger);
  text-decoration: underline;
}

.main-content {
  flex: 1;
  background: var(--color-background);
}

/* Page Transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
