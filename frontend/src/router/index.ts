import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import Group from '../views/GroupView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/group/:id', component: Group },
  ],
})

export default router