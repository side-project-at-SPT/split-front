<script setup>
import { computed, watchEffect } from 'vue'
const props = defineProps({
  modelValue: Boolean,
  character: {
    type: String,
    default: 'tux'
  }
})
const emit = defineEmits([ 'update:modelValue' ])

const showRuleModal = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})

watchEffect(() => {
  if (showRuleModal.value) {
    setTimeout(() => {
      showRuleModal.value = false
    }, 2000)
  }
})
</script>

<template>
  <div
    v-if="showRuleModal"
    class="absolute w-svw h-dvh bg-black bg-opacity-90 flex items-center justify-center z-10 selection:bg-blue-700 selection:text-white"
  >
    <div class="flex gap-2 p-10 items-center slide-in-out">
      <div
        :class="props.character"
        class="h-[200px] w-[200px]"
      ></div>
      <div class="text-[120px] text-white italic">
        輪到你了！
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

.bg-ice {
  background-image: linear-gradient(to bottom right, #b3d9ff, #218ed3);
}

.close-button {
  font-size: 1.5rem;
  color: #000;
  cursor: pointer;
  background: none;
  border: none;
}

.close-button:hover {
  color: #fff;
}

.tux {
  background-image: url('@/assets/images/tux.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.gunter {
  background-image: url('@/assets/images/gunter.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.abc {
  background-image: url('@/assets/images/abc.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
}

.sin {
  background-image: url('@/assets/images/sin.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.slide-in-out {
  animation: animate-slide-in-out 2s ease-in-out;
}
@keyframes animate-slide-in-out {
  0% {
    transform: translateX(200%);
  }

  30%,
  70% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-200%);
  }
}
</style>