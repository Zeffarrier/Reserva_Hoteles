import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import HotelDetailView from '../views/HotelDetailView.vue'
import MapView from '../views/MapView.vue'
import ReceptionistView from '../views/ReceptionistView.vue'
import AdminView from '../views/AdminView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import { useHotelStore } from '../store/hotelStore'

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

router.beforeEach((to, from, next) => {
  const { state } = useHotelStore()
  const currentUser = state.currentUser

  if (to.meta.requiresAuth && !currentUser) {
    next('/login')
  } else if (to.meta.requiresAuth && to.meta.roles) {
    const roles = to.meta.roles as string[]
    if (!roles.includes(currentUser!.role)) {
      next('/') // Forbidden, redirect to home
    } else {
      next()
    }
  } else if ((to.name === 'login' || to.name === 'register') && currentUser) {
    next('/') // Already logged in
  } else {
    next()
  }
})

export default router
