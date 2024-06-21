<script setup>
import {
  onMounted, ref, toRefs
} from 'vue'
import api from '@/assets/api'
import {
  RouterLink, useRouter 
} from 'vue-router'
import { useRoomStore } from '../stores/room'
import { useUserStore } from '../stores/user'
const roomStore = useRoomStore()
const userStore = useUserStore()
const { rooms, roomInfo } = toRefs(roomStore)
const { user } = toRefs(userStore)
const {
  getRooms, createRoom, joinRoom, leaveRoom, closeRoom, getRoomInfo, clearRoomInfo 
} = roomStore
const { getUserInfo } = userStore
const router = useRouter()
const isLogin = ref(false)
const userName = ref('')
const password = ref('')
const roomId = ref('')
const roomName = ref('')
const errorMessage = ref('')
const onlineUsers = ref({
  online_users: [], online_users_count: 0 
})
const showCreateRoomModal = ref(false)
let token = localStorage.getItem('token')
const handleCreateRoom = async () => {
  const data = await createRoom(roomName.value)
  showCreateRoomModal.value = false
  roomName.value = ''
  return data
}

const login = async () => {
  const data = await api.login(userName.value, password.value)
  if (data.token) {
    token = data.token
    doAfterLogin()
  }
  return
}

const handleSeeRoom = async (room) => {
  getRoomInfo(room.id).catch((error) => {
    showErrorMessage(error.error)
  })
}
const handleJoinRoom = async () => {
  joinRoom().catch((error) => {
    showErrorMessage(error.error)
  })
}
const handleLeaveRoom = async () => {
  leaveRoom().catch((error) => {
    showErrorMessage(error.error)
  })
}
const handleCloseRoom = async () => {
  closeRoom().catch((error) => {
    showErrorMessage(error.error)
  })
}
const handleBackRooms = async () => {
  clearRoomInfo()
}
const handleStartGame = async () => {
  try {
    const data = await api.startGame(roomId.value)
    router.push(`/game/?roomId=${ roomId.value }`)
    return data
  }
  catch (error) {
    showErrorMessage(error.error)
  }
}
const showErrorMessage = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 3000)
}
const getOnlineUsers = async () => {
  const data = await api.getOnlineUsers()
  onlineUsers.value = data
}
const openCreateRoomModal = async () => {
  showCreateRoomModal.value = true
}
let socket = null
const doAfterLogin = () => {
  isLogin.value = true
  getRooms()
  getUserInfo()
  const socketUrl = `wss://spt-games-split.zeabur.app/cable?token=${ token }`
  socket = new WebSocket(socketUrl)
  socket.onopen = () => {
    console.log('WebSocket is open now.')
    // 訂閱
    const authMessage = {
      command: 'subscribe',
      identifier: JSON.stringify({ channel: 'LobbyChannel' })
    }
    socket.send(JSON.stringify(authMessage))
  }
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'ping'){
      return
    }
    if (data.identifier?.includes('LobbyChannel')){
      if (data.type === 'confirm_subscription'){
        getOnlineUsers()
        console.log('訂閱成功')
      }
      console.log(data.message)
    }
    // console.log('Received:', event.data)
  }
}
onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    doAfterLogin()
  }
})
</script>

<template>
  <div class="relative">
    <div
      v-if="showCreateRoomModal"
      class="absolute w-svw h-dvh bg-black bg-opacity-50 flex items-center justify-center z-10"
    >
      <div class="hexagon-ice w-[300px] h-[300px] flex flex-col items-center justify-center">
        <div class="text-center text-white text-2xl font-semibold">
          新增房間
        </div>
        <div class="mt-5">
          <input
            v-model="roomName"
            class="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
            placeholder="房間名稱"
          >
        </div>
        <div class="mt-5 flex gap-2">
          <button
            class="hexagon-div flex  justify-center rounded-md bg-blue-300 h-[50px] w-[50px] items-center text-sm font-semibold  shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="handleCreateRoom"
          >
            新增
          </button>
          <button
            class="hexagon-div flex  justify-center rounded-md bg-blue-300 h-[50px] w-[50px] items-center text-sm font-semibold  shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="showCreateRoomModal = false"
          >
            取消
          </button>
        </div>
      </div>
    </div>
    <div class="flex gap-2">
      <RouterLink to="/game">
        Game
      </RouterLink>
      <div
        v-if="errorMessage"
        class="text-red"
      >
        {{ errorMessage }}
      </div>
    </div>
    <div v-if="!isLogin">
      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm flex flex-col gap-3 px-10">
        <div>
          <label
            for="email"
            class="block text-sm font-medium leading-6 text-gray-900"
          >Name</label>
          <div class="mt-2">
            <input
              id="email"
              v-model="userName"
              name="email"
              required
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
            >
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label
              for="password"
              class="block text-sm font-medium leading-6 text-gray-900"
            >Password</label>
          <!-- <div class="text-sm">
              <a
                href="#"
                class="font-semibold text-indigo-600 hover:text-indigo-500"
              >Forgot password?</a>
            </div> -->
          </div>
          <div class="mt-2">
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
            >
          </div>
        </div>

        <div class="mt-7">
          <button
            class="flex w-full justify-center rounded-md bg-blue-300 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="login"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
    <div v-if="isLogin">
      <div>
        您好: {{ user.nickname }}
      </div>
      <div @click="getOnlineUsers">
        在線人數: {{ onlineUsers.online_users_count }}
      </div>
      <div
        v-if="!roomInfo.id"
        class="flex gap-2 flex-wrap"
      >
        <div
          v-for="room in rooms"
          :key="room.id"
          class="text-center border-2 shrink-0 border-blue-300 w-[150px] h-[150px] bg-blue-50 rounded-md cursor-pointer flex justify-center hexagon-ice items-center hover:scale-105 transition-transform duration-300"
          @click="handleSeeRoom(room)"
        >
          <div class="py-2">
            {{ room.name }}
          </div>
        </div>
        <div
          class="w-[150px] h-[150px] new-room flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
          @click="openCreateRoomModal"
        >
          新增房間
        </div>
      </div>
      <div
        v-else
        class="flex justify-center"
      >
        <div class="flex flex-col justify-center items-center hexagon-ice w-[300px] h-[300px]">
          <div class="p-2">
            {{ roomInfo.name }}
          </div>
          <div
            class="hexagon-ice w-[70px] h-[70px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
            @click="handleStartGame"
          >
            開始遊戲
          </div>
          <div class="flex items-center justify-center gap-1">
            <div
              class="hexagon-ice w-[50px] h-[50px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
              @click="handleJoinRoom"
            >
              加入
            </div>
            <div
              class="hexagon-ice w-[50px] h-[50px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
              @click="handleLeaveRoom"
            >
              離開
            </div>
            <div
              class="hexagon-ice w-[50px] h-[50px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
              @click="handleCloseRoom"
            >
              關閉
            </div>
            <div
              class="hexagon-ice w-[50px] h-[50px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
              @click="handleBackRooms"
            >
              返回
            </div>
          </div>
        </div>
      </div>
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

  .hexagon-div {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
</style>