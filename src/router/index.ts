import { createRouter, createWebHistory } from 'vue-router'
import { useEventsStore } from '@/stores/events'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'events', component: () => import('@/views/Events.vue') },
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

// Views other than the events list require an active event.
router.beforeEach((to) => {
  if (to.name === 'events') return true
  const store = useEventsStore()
  if (!store.activeEvent) return { name: 'events' }
  return true
})

export default router
