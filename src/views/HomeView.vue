<script setup>
import {
  onMounted, ref 
} from 'vue'
import api from '@/assets/api'
import { RouterLink } from 'vue-router'
const isLogin = ref(false)
const rooms = ref([

])
const getRooms = async () => {
  const data = await api.getRooms()
  rooms.value = data.rooms
  return
}
const login = async () => {
  const data = await api.login('account', 'password')
  if (data.token) {
    isLogin.value = true
    getRooms()
  }
  return
}
const handleJoinRoom = async (room) => {
  alert(`join room ${ room.id }`)
  // return api.joinRoom(room.id)
}
onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    isLogin.value = true
    getRooms()
  }
})
</script>

<template>
  <div>
    <RouterLink to="/game">
      Game
    </RouterLink>
  </div>
  <div v-if="!isLogin">
    <div @click="login">
      登入
    </div>
  </div>
  <div
    v-if="isLogin"
    class="flex gap-2 flex-warp"
  >
    <div
      v-for="room in rooms"
      :key="room.id"
      class="text-center border-2 border-blue-300 w-[150px] h-[150px] bg-blue-50 rounded-md cursor-pointer flex justify-center hexagon-ice items-center hover:scale-105 transition-transform duration-300"
      @click="handleJoinRoom(room)"
    >
      <div class="py-2">
        {{ room.name }}
      </div>
    </div>
    <div class="w-[150px] h-[150px] new-room flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300 ">
      新增房間
    </div>
  </div>
</template>

<style scoped>
  .hexagon-ice {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    background-image: linear-gradient(to bottom right, #b3d9ff, #218ed3);
  }

  .new-room {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    background-image: linear-gradient(to bottom right, #cae5ff, #87b0ca);
  }
</style>