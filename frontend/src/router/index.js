import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../views/Welcome.vue'),
    },
    {
      path: '/loading',
      name: 'Loading',
      component: () => import('../views/loading.vue'),
    },
    {
      path: '/dashboard',
      component: () => import('../views/Dashboard.vue'),
    },
    {
      path: '/catalog',
      name: 'Catalog',
      component: () => import('../views/Catalog.vue'),
    },
    {
      path: '/analysis',
      name: 'Analysis',
      component: () => import('../views/Analysis.vue'),
    },
    {
      path: '/capture',
      name: 'Capture',
      component: () => import('../views/Capture.vue'),
    },
    {
      path: '/fight/:duckId',
      name: 'Fight',
      component: () => import('../views/Fight.vue'),
    },
    {
      path: '/captured',
      name: 'Captured',
      component: () => import('../views/Captured.vue'),
    },
    {
      path: '/drone',
      name: 'Drone',
      component: () => import('../views/Drone.vue'),
    },
    {
      path: '/map',
      name: 'Map',
      component: () => import('../views/Map.vue'),
    }
  ],
})

export default router
