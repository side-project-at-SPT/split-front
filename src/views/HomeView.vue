<script setup>
import { ref } from 'vue'
const pastures = ref([])
// initialize pastures
for (let x = 0; x < 5; x++)
  for (let y = 0; y < 5; y++)
    pastures.value.push({
      x, y, amount: 0, selected: false
    })
pastures.value[0].amount = 16
const originPasure = ref(null)
const targetPasure = ref(null)
let originAmount = 0
let targetAmount = 0
const handleClick = (pasture) => {
  if (!originPasure.value) {
    originPasure.value = pasture
    originAmount = pasture.amount
    pasture.selected = !pasture.selected
    return
  }
  if (!targetPasure.value) {
    targetPasure.value = pasture
    targetAmount = pasture.amount
    pasture.selected = !pasture.selected
    return
  }
  // 如果有選擇來源的牧場，且來源牧場有羊，則移動羊到目標牧場
  if (targetPasure.value === pasture) {
    if (originPasure.value && originPasure.value.amount > 1) {
      targetPasure.value.amount++
      originPasure.value.amount--
    }
    return
  }
  if (originPasure.value === pasture) {
    if (targetPasure.value && targetPasure.value.amount > 1) {
      originPasure.value.amount++
      targetPasure.value.amount--
    }
  }
}
const handleConfirm = () => {
  // const selectedPastures = pastures.value.filter(pasture => pasture.selected)
  // console.log(selectedPastures)
}
const handleCancel = () => {
  // 還原數字
  originPasure.value.selected = false
  targetPasure.value.selected = false
  originPasure.value.amount = originAmount
  targetPasure.value.amount = targetAmount
  originPasure.value = null
  targetPasure.value = null
}
</script>

<template>
  <span
    class="bg-blue-400 p-2 m-5"
    @click="handleConfirm"
  >
    確定移動
  </span>
  <span
    class="bg-blue-400 p-2 m-5"
    @click="handleCancel"
  >
    取消選取
  </span>
  <div class="text-white relative mt-10">
    <div
      v-for="pasture in pastures"
      :key="`${pasture.x}-${pasture.y}`"
      class="hexagon flex flex-col justify-center items-center text-black cursor-pointer"
      :class="{ 'bg-green-500': pasture.selected }"
      :style="{ left: `calc(${pasture.x * 105}px + ${pasture.y * 105}px * sin(30deg))`,
                top: `calc(${pasture.y * 105 / 2}px * sqrt(3) * cos(30deg))` }"
      @click="handleClick(pasture)"
    >
      <div>
        {{ `${pasture.x},${pasture.y}` }}
      </div>
      <div class="text-red">
        {{ pasture.amount }}
      </div>
    </div>
  </div>
</template>

<style>
  .hexagon {
    width: 100px;
    height: 100px;
    background-color: green;
    position: absolute;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
</style>