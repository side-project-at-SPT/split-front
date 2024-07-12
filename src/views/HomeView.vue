<script setup>
import { computed, onMounted, ref, toRefs } from 'vue'
import api from '@/assets/api'
import { RouterLink, useRouter } from 'vue-router'
import { useRoomStore } from '../stores/room'
import { useUserStore } from '../stores/user'
import { usePublicStore } from '../stores/public'
// import { createConsumer } from '@rails/actioncable'
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
const { rooms, roomInfo } = toRefs(roomStore)
const { user, onlineUsers } = toRefs(userStore)
const { consumer } = toRefs(publicStore)
const {
  getRooms, updateRoomPlayers, clearRoomInfo, joinRoom, closeRoom, updateRoomData
} = roomStore
const { getUsers, getUserInfo } = userStore
const { initConnection } = publicStore
const router = useRouter()
const isLogin = ref(false)
const userName = ref('')
const password = ref('')
// const roomId = ref('')
const errorMessage = ref('')
const showCreateRoomModal = ref(false)
const showChangeNicknameModal = ref(false)
const newNickname = ref('')
const roomMe = computed(() => {
  return roomInfo.value.players.find((player) => player.id === user.value.id) || {}
})
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
let roomChannel = null
const handleSeeRoom = async (room) => {
  joinRoom(room)
  roomChannel = consumer.value.subscriptions.create({ channel: 'RoomChannel', room_id: room.id }, {
    connected () {
      console.log('connected room channel', room.id)
      // 隨機選一個角色
      const randomIndex = Math.floor(Math.random() * roles.length)
      handleChangeRole(randomIndex)
    },
    disconnected () {
      console.log('disconnected room channel', room.id)
    },
    received (data) {
      if (data.event === 'room updated') {
        getRoomInfo(room.id)
      }
      else if (data.event === 'game_start_in_seconds') {
        const roomData = {
          id: room.id,
          gameStartInSeconds: data.seconds,
          status: 'starting'
        }
        updateRoomData(roomData)
      }
      else if (data.event === 'starting_game_is_cancelled'){
        const roomData = {
          id: room.id,
          gameStartInSeconds: 5,
          status: 'waiting'
        }
        updateRoomData(roomData)
      }
      else if (data.event === 'ready' || data.event === 'cancel_ready') {
        roomInfo.value.players.forEach((player) => {
          if (player.id === data.player.id
          ) {
            player.is_ready = data.player.is_ready
          }
        })
      }
      else if (data.event === 'set_character'){
        const roomData = {
          id: room.id,
          players: data.players
        }
        updateRoomPlayers(roomData)
      }
      else if (data.event === 'game_started') {
        const gameId = data.game_id
        router.push(`/game/?game_id=${ gameId }`)
      }
      console.log(data, 'data room channel', room.id)
    }
  })
}
const handleReady = async () => {
  console.log('ready')
  roomChannel.send({ action: 'ready' }) 
}
const handleCancelReady = async () => {
  console.log('cancel ready')
  roomChannel.send({ action: 'cancel_ready' }) 
}
const handleLeaveRoom = async () => {
  consumer.value.subscriptions.remove(roomChannel)
  clearRoomInfo()
}
const handleCloseRoom = async () => {
  closeRoom().catch((error) => {
    showErrorMessage(error.error)
  })
}
// const handleBackRooms = async () => {
//   clearRoomInfo()
// }
// const handleStartGame = async () => {
//   try {
//     const data = await api.startGame(roomId.value)
//     router.push(`/game/?roomId=${ roomId.value }`)
//     return data
//   }
//   catch (error) {
//     showErrorMessage(error.error)
//   }
// }
const showErrorMessage = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 3000)
}
const openCreateRoomModal = async () => {
  showCreateRoomModal.value = true
}
// let consumer = null
const doAfterLogin = () => {
  isLogin.value = true
  getRooms()
  getUserInfo()
  initConnection(token)
  // const socketUrl = `wss://spt-games-split.zeabur.app/cable?token=${ token }`
  // consumer = createConsumer(socketUrl)
  consumer.value.subscriptions.create({ channel: 'LobbyChannel' }, {
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

const roomStatus = {
  'waiting': '等待中',
  'starting': '即將開始',
  'playing': '進行中',
}
const handleChangeRole = (index) => {
  roomChannel.send({ action: 'set_character', character: roles[index] }) 
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
      <RouterLink to="/game">
        Game
      </RouterLink>
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
      <div
        v-else
        class="flex justify-center"
      >
        <div class="flex flex-col gap-2 justify-center items-center hexagon-ice w-[360px] h-[360px]">
          <div class="p-4 text-2xl">
            {{ roomInfo.name }}
            <div
              v-if="roomInfo.status === 'starting'"
              class="text-red"
            >
              {{ roomInfo.gameStartInSeconds }}秒後即將開始
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 items-center justify-center">
            <div
              v-for="(player, index) in roomInfo.players"
              :key="player.id"
              class="text-sm flex items-center justify-center gap-1"
            >
              <div
                v-if="player.is_ready"
                class="text-red"
              >
                <img
                  src="/src/assets/vue.svg"
                  class="w-6 h-6 object-contain"
                >
              </div>
              <div
                v-if="roles.indexOf(player.character) != -1"
                class="h-8 w-8"
              >
                <img
                  :src="penguins[roles.indexOf(player.character)]"
                  class="w-full h-full object-contain"
                >
              </div>
              <div
                v-else
                class="h-8 w-8"
              >
                <img
                  :src="penguins[index % 4]"
                  class="w-full h-full object-contain"
                >
              </div>
              <div>{{ player.nickname }}</div>
            </div>
          </div>
          <div>
            <div>選擇角色</div>
            <div class="flex">
              <div
                v-for="index in 4"
                :key="index"
                class="h-8 w-8"
                @click="handleChangeRole(index - 1)"
              >
                <img
                  :src="penguins[index - 1]"
                  class="w-6 h-6 object-contain"
                >
              </div>
            </div>
          </div>
          <div class="flex items-center justify-center gap-1">
            <!-- <div
              class="hexagon-ice w-[70px] h-[70px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
              @click="handleStartGame"
            >
              開始遊戲
            </div> -->
            <div
              v-if="!roomMe.is_ready"
              class="hexagon-ice w-[75px] h-[75px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
              @click="handleReady"
            >
              準備
            </div>
            <div
              v-else
              class="hexagon-ice w-[75px] h-[75px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
              @click="handleCancelReady"
            >
              取消準備
            </div>
            <div
              class="hexagon-ice w-[75px] h-[75px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
              @click="handleLeaveRoom"
            >
              離開
            </div>
            <div
              class="hexagon-ice w-[75px] h-[75px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
              @click="handleCloseRoom"
            >
              關閉
            </div>
            <!-- 
            <div
              class="hexagon-ice w-[50px] h-[50px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
              @click="handleBackRooms"
            >
              返回
            </div> -->
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