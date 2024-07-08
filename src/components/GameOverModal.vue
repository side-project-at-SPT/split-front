<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits([ 'update:modelValue' ])

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
      <slot></slot>
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