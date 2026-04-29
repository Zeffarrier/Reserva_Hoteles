<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'

const router = useRouter()
const { setAuth } = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const errorMsg = ref('')

const handleRegister = async () => {
  errorMsg.value = ''
  try {
    const res = await authService.register(name.value, email.value, password.value)
    setAuth(res.user, res.token)
    router.push('/')
  } catch (error: any) {
    errorMsg.value = error.message || 'Error al registrar la cuenta. Este correo podría ya estar registrado.'
  }
}
</script>

<template>
  <div class="view-container">
    <div class="auth-box animate-fade-in">
      <div class="auth-header">
        <h2>Crear Cuenta</h2>
        <p>Únete y reserva tu próxima estancia</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger">
        {{ errorMsg }}
      </div>

      <form @submit.prevent="handleRegister" class="form-body">
        <div class="input-group">
          <label class="input-label" for="name">Nombre Completo</label>
          <input 
            id="name"
            v-model="name" 
            type="text" 
            class="input-field" 
            placeholder="Ej: Ana García"
            required
          />
        </div>

        <div class="input-group">
          <label class="input-label" for="email">Correo Electrónico</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            class="input-field" 
            placeholder="ejemplo@correo.com"
            required
          />
        </div>

        <div class="input-group">
          <label class="input-label" for="password">Contraseña</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            class="input-field" 
            placeholder="••••••••"
            required
            minlength="3"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Registrarse</button>
        </div>
      </form>
      
      <div class="auth-footer">
        <p>¿Ya tienes una cuenta? <RouterLink to="/login">Inicia Sesión</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reusing auth styles from LoginView for consistency */
.view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
  min-height: calc(100vh - 80px);
}

.auth-box {
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.auth-header h2 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.auth-header p {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
}

.btn-block {
  width: 100%;
}

.auth-footer {
  margin-top: var(--spacing-lg);
  text-align: center;
  font-size: var(--font-size-sm);
}

.auth-footer a {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.alert {
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  text-align: center;
  font-size: var(--font-size-sm);
}

.alert-danger {
  background-color: var(--color-danger-light);
  color: #991b1b;
  border: 1px solid var(--color-danger);
}
</style>
