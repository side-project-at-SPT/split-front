<script setup>
import { ref, computed } from 'vue'
import { useRoomStore } from '../stores/room'
import { useRouter } from 'vue-router'
const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits([ 'update:modelValue' ])
const roomStore = useRoomStore()
const router = useRouter()
const { createRoom, getRoomToken } = roomStore
const roomName = ref('')
const handleCreateRoom = async () => {
  const { room } = await createRoom(roomName.value)
  showCreateRoomModal.value = false
  roomName.value = ''
  // 取得room token
  const { token } = await getRoomToken(room.id)
  localStorage.setItem('roomToken', token)
  // 跳轉到room頁面
  router.push(`/room/${ room.id }`)
}
const showCreateRoomModal = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})
</script>

<template>
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
</template>

<style scoped>
  .hexagon-ice {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    background-image: linear-gradient(to bottom right, #b3d9ff, #218ed3);
  }

  .hexagon-div {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
</style>