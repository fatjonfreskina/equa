import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import Group from '../views/GroupView.vue'
import Privacy from '../views/PrivacyView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/group/:id', component: Group },
    { path: '/privacy', component: Privacy },
  ],
})

export default router
