import { createRouter, createWebHistory } from 'vue-router'
import { useTripsStore } from '@/stores/trips'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'trips', component: () => import('@/views/Trips.vue') },
    { path: '/receipt', name: 'receipt', component: () => import('@/views/Receipt.vue') },
    {
      path: '/receipt/:personId',
      name: 'person-receipt',
      component: () => import('@/views/PersonReceipt.vue'),
      props: true,
    },
    { path: '/add', name: 'add', component: () => import('@/views/Add.vue') },
    { path: '/items', name: 'items', component: () => import('@/views/Items.vue') },
  ],
})

// Views other than the trips list require an active trip.
router.beforeEach((to) => {
  if (to.name === 'trips') return true
  const store = useTripsStore()
  if (!store.activeTrip) return { name: 'trips' }
  return true
})

export default router
