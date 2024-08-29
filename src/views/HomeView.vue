<script setup>
import { onMounted, ref, toRaw, toRefs } from 'vue'
import api from '@/assets/api'
import { useRouter } from 'vue-router'
import { useRoomStore } from '../stores/room'
import { useUserStore } from '../stores/user'
import { usePublicStore } from '../stores/public'
import CreateRoomModal from '@/components/CreateRoomModal.vue'
import ChangeNicknameModal from '../components/ChangeNicknameModal.vue'
import Tux from '@/assets/images/tux.png'
import Gunter from '@/assets/images/gunter.png'
import Sin from '@/assets/images/sin.png'
import Abc from '@/assets/images/abc.png'
const penguins = [ Tux, Gunter, Sin, Abc ]
const roles = [ 'tux', 'gunter', 'sin', 'abc' ]
const roomStore = useRoomStore()
const userStore = useUserStore()
const publicStore = usePublicStore()
const { rooms } = toRefs(roomStore)
const { user, onlineUsers } = toRefs(userStore)
let consumer = toRaw(publicStore.consumer)
const {
  getRooms, updateRoomPlayers,
} = roomStore
const { getUsers, getUserInfo } = userStore
const { initConnection } = publicStore
const router = useRouter()
const isLogin = ref(false)
const userName = ref('')
const password = ref('')
const errorMessage = ref('')
const showCreateRoomModal = ref(false)
const showChangeNicknameModal = ref(false)
const newNickname = ref('')
let token = localStorage.getItem('token')

const login = async () => {
  try {
    const data = await api.login(userName.value, password.value)
    if (data.token) {
      token = data.token
      doAfterLogin()
    }
    return
  }
  catch (error) {
    showErrorMessage(error.error)
  }
}
const loginAsVisitor = async () => {
  try {
    const data = await api.loginAsVisitor()
    if (data.token) {
      token = data.token
      doAfterLogin()
    }
    return
  }
  catch (error) {
    showErrorMessage(error.error)
  }
}
// let roomChannel = null
const handleSeeRoom = async (room) => {
  // const hasPlayer = room.players.length > 0
  // const isMePlaying = room.players.some((player) => player.id === user.value.id)
  if (room.status === 'playing'){
    // showErrorMessage('遊戲進行中，無法進入')
    // 進入觀戰模式
    router.push(`/game/?game_id=${ room.game_id }&room_id=${ room.id }`)
    return
  }
  // 跳轉到room頁面
  router.push(`/room/${ room.id }`)
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
const doAfterLogin = () => {
  isLogin.value = true
  getRooms()
  getUserInfo()
  if (!consumer){
    initConnection(token)
    consumer = toRaw(publicStore.consumer)
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
        if (data.event === 'create_room' || data.event === 'room_closed') {
          getRooms()
        }
        if (data.event === 'join_room' || data.event === 'leave_room'){
          updateRoomPlayers(data.room)
        }
        console.log(data, 'data')
      }
    })
  } 
  else {
    // 檢查是否已經訂閱過LobbyChannel
    if (consumer.subscriptions.findAll('{\"channel\":\"LobbyChannel\"}').length === 0){
      // initConnection(token)
      publicStore.consumer.subscriptions.create({ channel: 'LobbyChannel' }, {
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
          if (data.event === 'create_room' || data.event === 'room_closed') {
            getRooms()
          }
          if (data.event === 'join_room' || data.event === 'leave_room'){
            updateRoomPlayers(data.room)
          }
          if (data.event === 'game_started'){
            getRooms()
          }
          console.log(data, 'data')
        }
      })
    }
  }
}
const roomStatus = {
  'waiting': '等待中',
  'starting': '即將開始',
  'playing': '進行中',
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
    <ChangeNicknameModal v-model="showChangeNicknameModal" />
    <div class="flex gap-2">
      <div
        v-if="errorMessage && isLogin"
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
        <div class="text-red">
          {{ errorMessage }}
        </div>
        <div class="mt-7">
          <button
            class="flex w-full justify-center rounded-md bg-blue-300 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="login"
          >
            Sign in
          </button>
          <button
            class="mt-7 flex w-full justify-center rounded-md bg-blue-300 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="loginAsVisitor"
          >
            Sign in as visitor
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
            <div class="text-sm">
              {{ roomStatus[room.status] }}
            </div>
          </div>

          <div
            v-for="(player, index) in room.players"
            :key="player.id"
            class="text-sm flex items-center"
          >
            <div
              v-if="roles.indexOf(player.character) != -1"
              class="h-5 w-5"
            >
              <img
                :src="penguins[roles.indexOf(player.character)]"
                class="w-full h-full object-contain"
              >
            </div>
            <div
              v-else
              class="h-5 w-5"
            >
              <img
                :src="penguins[index]"
                class="w-full h-full object-contain"
              >
            </div>
            <div>
              {{ player.nickname }}
            </div> 
          </div>
        </div>
        <div
          class="w-[150px] h-[150px] new-room flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
          @click="openCreateRoomModal"
        >
          新增房間
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