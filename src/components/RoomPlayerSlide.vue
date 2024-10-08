<script setup>
import { ref } from 'vue'
import Aptenodytes from '@/assets/roomPLayers/aptenodytes.png'
import Eudyptes from '@/assets/roomPLayers/eudyptes.png'
import Eudyptula from '@/assets/roomPLayers/eudyptula.png'
import Papua from '@/assets/roomPLayers/papua.png'

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
  nameEditSwitch: {
    type: Boolean,
    default: true,
    required: true,
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
</script>

<template>
  <div class="w-[280px] h-[280px] relative">
    <div
      ref="playersRef"
      :class="`flex relative z-10 ${props.choseLock? 'overflow-hidden':''}`"
    >
      <img
        v-for="(item,index) in players"
        :key="item"    
        :src="item"
        alt=""
        class="avatar "
        :class="{ 'focused': chosePlayer === index }"
        tabindex="0"
        @click="()=>handelChosePlayer(index)"
      >
    </div>
    <img
      src="@/assets/roomPLayers/stage.svg"
      alt=""
      class="stage"
    >
    <div class="inputBox flex items-center justify-center">
      <p class="text-white font-bold text-lg mr-4">
        {{ props.name }}
      </p>
      <button
        :class="`bg-[url(@/assets/roomPlayers/${props.nameEditSwitch?'edit':'editGray'}.svg)] bg-center bg-cover w-8 h-8`"
        @click="()=>emits('changeName')"
      ></button>
    </div>
  </div>
</template>

<style scoped>
  .stage{
    width: 226px;
    height: 124px;
    position: absolute;
    bottom: -64px;
    left: 50%;
    transform: translate(-50%,0%);
  }
  .inputBox{
    width:200px;
    height:48px;
    border-radius: 30px;
    background: #0F2A30E5;
    position: absolute;
    left:50%;
    top:325px;
    transform: translate(-50%,0%);
    z-index: 1;
  }
  .avatar{
    width: 200px;
    height: 200px;
    transition: all 0.4s ease;
    opacity: 0.6;
  }
  .avatar:focus,
  .avatar.focused{
    width: 280px;
    height: 280px;
    opacity: 1;
    transition: all 1s ease;
  }
</style>