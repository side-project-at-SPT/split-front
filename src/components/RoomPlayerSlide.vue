<script setup>
import { ref, watch } from 'vue'
import Aptenodytes from '@/assets/roomPlayers/aptenodytes.png'
import Eudyptes from '@/assets/roomPlayers/eudyptes.png'
import Eudyptula from '@/assets/roomPlayers/eudyptula.png'
import Papua from '@/assets/roomPlayers/papua.png'

const props = defineProps({
  name: {
    type: String,
    default: '',
    required: true
  },
  imageKey: {
    type: Number,
    default: 0,
    required: true
  },
  choseLock: {
    type: Boolean,
    default: false,
    required: true
  }
})
const emits = defineEmits([ 'chosePlayer', 'changeName' ])
const players = [ Aptenodytes, Papua, Eudyptula, Eudyptes ]
const playersRef = ref()
const chosePlayer = ref(props.imageKey)
const handelChosePlayer = (index) => { 
  chosePlayer.value = index
  emits('chosePlayer', index)
  playersRef.value.style = `transform:translate3D(-${ index * 200 }px,0px,20px); transition:all 1s;`
}

watch(() => props.imageKey, () => {
  handelChosePlayer(props.imageKey)
}, { once: true })

</script>

<template>
  <div class="w-[280px] h-[280px] relative">
    <div
      ref="playersRef"
      class="flex relative z-10  h-[280px] "
    >
      <img
        v-for="(item,index) in players"
        :key="item"    
        :src="item"
        alt=""
        class="avatar"
        :class="{
          'focused': chosePlayer === index,
          'opacity-60': chosePlayer === index,
          'opacity-0': props.choseLock
        }"
        tabindex="0"
        @click="()=>handelChosePlayer(index)"
      >
    </div>
    <img
      src="@/assets/roomPlayers/stage.svg"
      alt=""
      class="stage"
    >
    <div class="inputBox flex items-center justify-center">
      <p class="text-white font-bold text-lg mr-4">
        {{ props.name }}
      </p>
      <button
        :class="`bg-[url(@/assets/roomPlayers/edit.svg)] bg-center bg-cover w-8 h-8 ${props.choseLock?'opacity-40':''}`"
        :disabled="props.choseLock"
        @click="()=>emits('changeName')"
      ></button>
    </div>
  </div>
</template>

<style scoped>
  .stage {
    position: absolute;
    bottom: -64px;
    left: 50%;
    width: 226px;
    height: 124px;
    transform: translate(-50%, 0%);
  }

  .inputBox {
    position: absolute;
    top: 325px;
    left: 50%;
    z-index: 1;
    width: 200px;
    height: 48px;
    background: #0f2a30e5;
    border-radius: 30px;
    transform: translate(-50%, 0%);
  }

  .avatar {
    width: 200px;
    height: 200px;
    transition: all .4s ease;
  }

  .avatar:focus,
  .avatar.focused {
    width: 280px;
    height: 280px;
    opacity: 1;
    transition: all 1s ease;
  }
</style>