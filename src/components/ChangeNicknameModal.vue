<script setup>
import { ref, computed, toRefs } from 'vue'
import { useUserStore } from '../stores/user'
const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits([ 'update:modelValue' ])
const userStore = useUserStore()
const { user } = toRefs(userStore)
const { setNickname } = userStore
const newNickname = ref(user.value.nickname)
const showChangeNicknameModal = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})
const handleSetNickname = () => {
  setNickname(newNickname.value).then(() => {
    showChangeNicknameModal.value = false
  })
}
</script>

<template>
  <div
    v-if="showChangeNicknameModal"
    class="absolute w-svw h-dvh bg-black bg-opacity-50 flex items-center justify-center z-50 top-0"
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