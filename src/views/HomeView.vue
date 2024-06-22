<script setup>
import { onMounted, ref, toRefs } from 'vue'
import api from '@/assets/api'
import { RouterLink, useRouter } from 'vue-router'
import { useRoomStore } from '../stores/room'
import { useUserStore } from '../stores/user'
import { createConsumer } from '@rails/actioncable'
import CreateRoomModal from '@/components/CreateRoomModal.vue'
const roomStore = useRoomStore()
const userStore = useUserStore()
const { rooms, roomInfo } = toRefs(roomStore)
const { user, onlineUsers } = toRefs(userStore)
const {
  getRooms, updateRoomPlayers, closeRoom, clearRoomInfo, joinRoom
} = roomStore
const { getUsers, getUserInfo, setNickname } = userStore
const router = useRouter()
const isLogin = ref(false)
const userName = ref('')
const password = ref('')
const roomId = ref('')
const errorMessage = ref('')
const showCreateRoomModal = ref(false)
const showChangeNicknameModal = ref(false)
const newNickname = ref('')
let token = localStorage.getItem('token')

const login = async () => {
  const data = await api.login(userName.value, password.value)
  if (data.token) {
    token = data.token
    doAfterLogin()
  }
  return
}
let roomChannel = null
const handleSeeRoom = async (room) => {
  joinRoom(room)
  roomChannel = consumer.subscriptions.create({ channel: 'RoomChannel', room_id: room.id }, {
    connected () {
      console.log('connected room channel', room.id)
    },
    disconnected () {
      console.log('disconnected room channel', room.id)
    },
    received (data) {
      if (data.event === 'room updated') {
        getRoomInfo(room.id)
      }
      console.log(data, 'data room channel', room.id)
    }
  })
}
const handleReady = async () => {
  console.log('ready')
  roomChannel.send({ action: 'ready' }) 
}
const handleLeaveRoom = async () => {
  consumer.subscriptions.remove(roomChannel)
  clearRoomInfo()
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
const openCreateRoomModal = async () => {
  showCreateRoomModal.value = true
}
let consumer = null
const doAfterLogin = () => {
  isLogin.value = true
  getRooms()
  getUserInfo()
  const socketUrl = `wss://spt-games-split.zeabur.app/cable?token=${ token }`
  consumer = createConsumer(socketUrl)
  consumer.subscriptions.create({ channel: 'LobbyChannel' }, {
    connected () {
      getUsers()
      console.log('connected')
    },
    disconnected () {
      console.log('disconnected')
    },
    received (data) {
      if (data.event === 'user preferences updated') {
        getUsers()
      }
      if (data.event === 'create_room') {
        getRooms()
      }
      if (data.event === 'join_room' || data.event === 'leave_room'){
        updateRoomPlayers(data.room)
      }
      console.log(data, 'data')
    }
  })
}
const handleSetNickname = () => {
  setNickname(newNickname.value).then(() => {
    showChangeNicknameModal.value = false
    newNickname.value = ''
  })
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
    <CreateRoomModal v-model="showCreateRoomModal" />
    <div
      v-if="showChangeNicknameModal"
      class="absolute w-svw h-dvh bg-black bg-opacity-50 flex items-center justify-center z-10"
    >
      <div class="hexagon-ice w-[300px] h-[300px] flex flex-col items-center justify-center">
        <div class="text-center text-white text-2xl font-semibold">
          修改暱稱
        </div>
        <div class="mt-5">
          <input
            v-model="newNickname"
            class="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
            placeholder="暱稱"
          >
        </div>
        <div class="mt-5 flex gap-2">
          <button
            class="hexagon-div flex  justify-center rounded-md bg-blue-300 h-[50px] w-[50px] items-center text-sm font-semibold  shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="handleSetNickname"
          >
            修改
          </button>
          <button
            class="hexagon-div flex  justify-center rounded-md bg-blue-300 h-[50px] w-[50px] items-center text-sm font-semibold  shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="showChangeNicknameModal = false, newNickname = ''"
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
      <div class="flex gap-2">
        <div>您好: {{ user.nickname }}</div><button
          class="bg-blue-300 rounded-md px-2 text-xs hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          @click="showChangeNicknameModal = true, newNickname = user.nickname"
        >
          修改暱稱
        </button>
      </div>
      <div class="flex gap-3 items-center">
        <div>在線人數: {{ onlineUsers.length }} 人:</div>
        <div
          v-for="onlineUser in onlineUsers"
          :key="onlineUser.id"
          class=""
        >
          {{ onlineUser.nickname }}
        </div>
      </div>
      <div
        v-if="!roomInfo.id"
        class="flex gap-2 flex-wrap"
      >
        <div
          v-for="room in rooms"
          :key="room.id"
          class="text-center border-2 shrink-0 border-blue-300 w-[150px] h-[150px] bg-blue-50 rounded-md cursor-pointer flex flex-col justify-center hexagon-ice items-center hover:scale-105 transition-transform duration-300"
          @click="handleSeeRoom(room)"
        >
          <div class="py-2">
            {{ room.name }}
          </div>
          <div
            v-for="player in room.players"
            :key="player.id"
            class="text-sm"
          >
            {{ player.nickname }}
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
            v-for="player in roomInfo.players"
            :key="player.id"
            class="text-sm"
          >
            {{ player.nickname }}
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
              @click="handleReady"
            >
              準備
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