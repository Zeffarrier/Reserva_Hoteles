import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import HotelDetailView from '../views/HotelDetailView.vue'
import MapView from '../views/MapView.vue'
import ReceptionistView from '../views/ReceptionistView.vue'
import AdminView from '../views/AdminView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import { useAuthStore } from '../store/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/hotel/:id',
      name: 'hotel-detail',
      component: HotelDetailView
    },
    {
      path: '/mapa',
      name: 'map',
      component: MapView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/receptionist',
      name: 'receptionist',
      component: ReceptionistView,
      meta: { requiresAuth: true, roles: ['receptionist', 'admin'] }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true, roles: ['admin'] }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const { state } = useAuthStore()
  const currentUser = state.currentUser

  // 1. Ya está logueado pero intenta ir a login/register
  if ((to.name === 'login' || to.name === 'register') && currentUser) {
    if (currentUser.role === 'admin') return next('/admin')
    if (currentUser.role === 'receptionist') return next('/receptionist')
    return next('/')
  }

  // 2. Ruta requiere autenticación pero no hay usuario
  if (to.meta.requiresAuth && !currentUser) {
    return next('/login')
  }

  // 3. Usuario autenticado: Restringir a sus paneles correspondientes
  if (currentUser) {
    // El admin no debería poder ver la vista de cliente (home, mapa, hotel-detail)
    if (currentUser.role === 'admin' && to.name !== 'admin' && to.name !== 'profile') {
      return next('/admin')
    }
    
    // El recepcionista tampoco debería estar navegando como cliente
    if (currentUser.role === 'receptionist' && to.name !== 'receptionist' && to.name !== 'profile') {
      return next('/receptionist')
    }

    // Validación extra para otras vistas si se requiere
    if (to.meta.roles) {
      const roles = to.meta.roles as string[]
      if (!roles.includes(currentUser.role)) {
        return next('/') 
      }
    }
  }

  // 4. Todo en orden, permitir navegación
  next()
})

export default router

