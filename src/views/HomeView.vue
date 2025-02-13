<script setup>
import { onMounted, ref, toRaw, toRefs } from 'vue'
import api from '@/assets/api'
import { useRouter } from 'vue-router'
import { useRoomStore } from '../stores/room'
import { useUserStore } from '../stores/user'
import { usePublicStore } from '../stores/public'
import CreateRoomModal from '@/components/CreateRoomModal.vue'
// import ChangeNicknameModal from '../components/ChangeNicknameModal.vue'
import DefaultButton from '../components/DefaultButton.vue'
import RoomDialog from '../components/RoomDialog.vue'
import RoomBox from '../components/RoomBox.vue'
const roomStore = useRoomStore()
const userStore = useUserStore()
const publicStore = usePublicStore()
const { sortedRooms } = toRefs(roomStore)
const { user, onlineUsers } = toRefs(userStore)
let consumer = toRaw(publicStore.consumer)
const {
  getRooms, updateRoomPlayers
} = roomStore
const { getUsers, getUserInfo, setNickname } = userStore
const { initConnection, toggleAudio } = publicStore
const { musicPlaying } = toRefs(publicStore)
const router = useRouter()
const isLogin = ref(false)
const userName = ref('')
const password = ref('')
const errorMessage = ref('')
const showCreateRoomModal = ref(false)
const showChangeNicknameModal = ref(false)
const showLeaveModel = ref(false)
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
const handleLogout = () => {
  localStorage.removeItem('token')
  isLogin.value = false
  token = null
  showLeaveModel.value = false
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
  if (room.players.length >= 4){
    showErrorMessage('房間已滿')
    return
  }
  // roomToken 改到room內再取得
  // getRoomToken(room.id).then((data) => {
  //   // 跳轉到room頁面
  //   localStorage.setItem('roomToken', data.token)
  // })
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
        }
      })
    }
  }
}
onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    doAfterLogin()
  }
})
const handelEditNickname = (newName) => {
  setNickname(newName).then(() => { 
    showChangeNicknameModal.value = false
  })
}
</script>

<template>
  <div
    class="relative"
    :class="{ 'login-page': !isLogin,
              'room-page': isLogin }"
  >
    <CreateRoomModal v-model="showCreateRoomModal" />
    <!-- <ChangeNicknameModal v-model="showChangeNicknameModal" /> -->
    <RoomDialog
      v-if="showChangeNicknameModal"
      v-model="showChangeNicknameModal"
      :title="'修改暱稱'"
      :input-default-value="user.nickname"
      is-edit
      @on-check="handelEditNickname"
    />
    <RoomDialog
      v-if="showLeaveModel"
      v-model="showLeaveModel"
      title="登出"
      :input-default-value="user.nickname"
      submit-button-text="確認離開"
      content-text="要說再見了嗎？"
      @on-check="handleLogout"
    />
    <div class="flex gap-2">
      <div
        v-if="errorMessage && isLogin"
        class="text-red"
      >
        {{ errorMessage }}
      </div>
    </div>
    <div
      v-if="!isLogin"
      class="flex h-full items-center justify-end"
    >
      <div
        id="login-panel"
        class="flex flex-col items-center px-10"
      >
        <div class="snow-left"></div>
        <div class="snow-right"></div>
        <div class="logo2"></div>
        <div class="mt-8 flex flex-col gap-5 w-full">
          <input
            id="username"
            v-model="userName"
            name="username"
            required
            placeholder="玩家暱稱"
            class="w-full input"
          >          
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            required
            placeholder="密碼"
            class="w-full input"
          >
        </div>
        <div class="text-red">
          {{ errorMessage }}
        </div>
        <div class="mt-8">
          <DefaultButton
            text="登入遊戲"
            @click="login"
          />
          <button
            class="mt-3 h-[50px] flex w-full justify-center items-center text-xl text-text "
            @click="loginAsVisitor"
          >
            訪客身份登入
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="isLogin"
      class="px-10 pt-10"
    >
      <div class="flex justify-between">
        <div class="flex gap-2 items-center">
          <div
            class="inputBox flex items-center justify-center px-5 mr-4"
            @click="showChangeNicknameModal = true"
          >
            <p class="text-white font-bold text-lg mr-4 grow">
              {{ user.nickname }}
            </p>
            <button
              class="bg-[url(@/assets/roomPlayers/edit.svg)] bg-center bg-cover w-6 h-6"
            ></button>
          </div>
          <div class="text-text">
            在線人數: {{ onlineUsers.length }} 人
          </div>
        </div>
        <button
          class="w-[62px] h-[62px] rounded-[50%] bg-[url(@/assets/roomPlayers/goBackButton.jpg)]"
          @click="showLeaveModel = true"
        ></button>
      </div>
      <div
        class="flex gap-y-10 gap-x-7 flex-wrap mt-10 justify-center"
      >
        <div
          class="add-room text-text"
          @click="openCreateRoomModal"
        >
          新增房間
        </div>
        <RoomBox
          v-for="room in sortedRooms"
          :key="room.id"
          :room="room"
          @click="handleSeeRoom(room)"
        />
      </div>
    </div>
    <div
      class="w-[62px] h-[62px] p-2 cursor-pointer pointer-events-auto rounded-full bg-gradient-to-b  border border-[#DBDFEO] flex justify-center items-center fixed right-10 bottom-10"
      :class="musicPlaying ? 'shadow-button from-[#FFFFFF] to-[#DAFFFF]' : 'shadow-buttonOff from-[#FFFFFF] to-[#DBDFE0]'"
      @click="toggleAudio"
    >
      <div
        class=" h-[38px] w-[38px]"
        :class="musicPlaying ? 'music-on' : 'music-off'"
      ></div>
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

.login-page {
  height: 100vh;
  background-image: url('@/assets/images/login-bg.webp');
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: 100% 100%;
}

.room-page {
  height: 100vh;
  background-image: url('@/assets/images/room-bg.webp');
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: 100% 100%;
}

.inputBox {
  width: 200px;
  height: 48px;
  background: #0f2a30e5;
  border-radius: 30px;
}

#login-panel {
  position: relative;
  box-sizing: border-box;
  width: 440px;
  height: 570px;
  margin-right: 148px;
  padding-right: 72px;
  padding-left: 72px;
  background: linear-gradient(180deg, #d6edf5 0%, #84ddf6 100%);
  border: 4px solid #b2efff;
  border-radius: 40px;

  .logo2 {
    width: 296px;
    height: 198px;
    margin-top: 60px;
    background-image: url('@/assets/images/logo2.webp');
    background-repeat: no-repeat;
    background-size: contain;
  }

  .snow-left {
    position: absolute;
    top: -28px;
    left: -16px;
    z-index: 1;
    width: 182px;
    height: 84px;
    background-image: url('@/assets/images/gameover/deco-snow-left.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }

  .snow-right {
    position: absolute;
    top: -28px;
    right: -16px;
    z-index: 1;
    width: 206px;
    height: 84px;
    background-image: url('@/assets/images/gameover/deco-snow-right.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }

  .input {
    gap: 12px;
    width: 100%;
    height: 48px;
    padding: 4px 8px 4px 8px;
    color: #006989;
    text-align: center;
    border-radius: 48px;

    &:focus {
      outline-color: #006989;
    }
  }
}

.add-room {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 260px;
  height: 200px;
  font-size: 20px;
  font-weight: medium;
  cursor: pointer;
  border-color: #ffffff;
  border-width: 4px;
  border-radius: 24px;
}
</style>