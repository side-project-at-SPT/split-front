<script setup>

defineProps({
  text: {
    type: String,
    default: '',
    required: true,
  },
  isShow: {
    type: Boolean,
    default: true,
    required: false,
  }
})
const emit = defineEmits([ 'onClick' ])

</script>

<template>
  <div
    v-if="isShow"
    class="hexagon-ice w-[75px] h-[75px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
    @click="emit('onClick')"
  >
    {{ text }}
  </div>
</template>

<style scoped>

  .hexagon-ice {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    background-image: linear-gradient(to bottom right, #b3d9ff, #218ed3);
  }
</style>