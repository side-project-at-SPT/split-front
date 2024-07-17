import {
  createRouter, createWebHashHistory 
} from 'vue-router'
import Home from '@/views/HomeView.vue'
import apiPanel from '@/views/apiPanel.vue'
import Game from '@/views/GameView.vue'
import Room from '@/views/RoomView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/panel',
      name: 'panel',
      component: apiPanel
    },
    {
      path: '/game',
      name: 'game',
      component: Game
    },
    {
      path: '/room/:roomId',
      name: 'room',
      component: Room
    },
    {
      path: '/:pathMatch(.*)*', redirect: { name: 'home' } 
    }
  ],
  scrollBehavior () {
    // always scroll to top
    return { top: 0 }
  }
})

export default router