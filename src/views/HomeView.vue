<script setup>
import {
  onMounted, ref 
} from 'vue'
import api from '@/assets/api'
// import { Client } from '@stomp/stompjs'
import {
  RouterLink, useRouter 
} from 'vue-router'
const router = useRouter()
const isLogin = ref(false)
const userName = ref('')
const password = ref('')
const name = ref('')
const rooms = ref([])
const roomId = ref('')
const roomInfo = ref({})
const roomName = ref('')
const errorMessage = ref('')
const createRoom = async () => {
  const data = await api.createRoom(roomName.value)
  showCreateRoomModal.value = false
  getRooms()
  roomName.value = ''
  return data
}
const showCreateRoomModal = ref(false)
const getRooms = async () => {
  const data = await api.getRooms()
  rooms.value = data.rooms
  return
}
const login = async () => {
  const data = await api.login(userName.value, password.value)
  if (data.token) {
    isLogin.value = true
    getRooms()
    getUserInfo()
  }
  return
}
const getUserInfo = async () => {
  try {
    const data = await api.getUserInfo()
    name.value = data.name
    return 
  } catch (error) {
    showErrorMessage(error.error)
  }
}
const getRoomInfo = async (roomId) => {
  try {
    const data = await api.getRoomInfo(roomId)
    roomInfo.value = data.room
    return 
  } catch (error) {
    showErrorMessage(error.error)
  }
}
const handleSeeRoom = async (room) => {
  await getRoomInfo(room.id)
  roomId.value = room.id
}
const handleJoinRoom = async () => {
  try {
    await api.joinRoom(roomId.value)
  } catch (error) {
    showErrorMessage(error.error)
  }
}
const handleLeaveRoom = async () => {
  try {
    await api.leaveRoom(roomId.value)
  } catch (error) {
    showErrorMessage(error.error)
  }
}
const handleCloseRoom = async () => {
  try {
    await api.closeRoom(roomId.value)
    await getRooms()
    roomId.value = ''
  } catch (error) {
    showErrorMessage(error.error)
  }
}
const handleBackRooms = async () => {
  roomId.value = ''
  getRooms()
}
const handleStartGame = async () => {
  try {
    const data = await api.startGame(roomId.value)
    router.push(`/game/${ roomId.value }`)
    return data
  } catch (error) {
    showErrorMessage(error.error)
  }
}
const showErrorMessage = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 3000)
}
const handleCreateRoom = async () => {
  showCreateRoomModal.value = true
}
// let socketClient = null
// const isConnected = ref(false)
onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    isLogin.value = true
    getRooms()
    getUserInfo()
    console.log('token', token)
    // socketClient = new Client({
    //   brokerURL: 'wss://spt-games-split.zeabur.app/cable',
    //   reconnectDelay: 5000,
    //   heartbeatIncoming: 4000,
    //   heartbeatOutgoing: 4000,
    // })
    // socketClient.onConnect = (frame) => {
    //   isConnected.value = true
    //   console.log('Connected: ' + frame)
    //   socketClient.subscribe(
    //     '/LobbyChannel',
    //     async (greeting) => {
    //       const res = JSON.parse(greeting.body)
    //       console.log(res)
    //     },
    //   )
    // }
    // socketClient.activate()
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
            @click="createRoom"
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
        您好: {{ name }}
      </div>
      <div
        v-if="!roomId"
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
          @click="handleCreateRoom"
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