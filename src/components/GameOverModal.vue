<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: Boolean,
  finalPlayers: {
    type: Array,
    required: true
  },
})
const emit = defineEmits([ 'update:modelValue', 'handleback-room' ])

const showGameOverModal = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})
const handlebackRoom = () => {
  console.log('handleback-room')
  emit('handleback-room')
}
const firstPlacePlayer = computed(() => {
  return props.finalPlayers[0]
})
const otherPlayers = computed(() => {
  return props.finalPlayers.slice(1)
})
</script>

<template>
  <div
    v-if="showGameOverModal"
    class="w-svw h-dvh bg-[#0F2A30E5] flex items-center justify-center z-30 fixed top-0 left-0"
  >
    <div class="flex flex-col items-center justify-center game-over-modal-container">
      <div class="title"></div>
      <div class="snow-left"></div>
      <div class="snow-right"></div>
      <div
        class="w-[800px] h-[440px] flex flex-col items-center justify-around score-board relative"
      >
        <div class="first-place-player">
          <div class="bg"></div>
          <div class="shine"></div>
          <div
            class="character"
            :class="firstPlacePlayer.character"
          ></div>
          <div
            class="rank"
            :class="firstPlacePlayer.color"
          ></div>
          <div class="score-container">
            <div class="name">
              {{ firstPlacePlayer.name }}
            </div>
            <div class="score">
              <div>{{ firstPlacePlayer.score }}</div>
              <div>分</div>
              <div class="ml-2">
                最大區塊
              </div>
              <div>{{ firstPlacePlayer.largestPasture }}</div>
            </div>
          </div>
        </div>
        <div class="other-player-container">
          <div
            v-for="(player,i) in otherPlayers"
            :key="player.name"
            class="flex items-center justify-center gap-2 banner"
          >
            <div
              class="rank" 
              :class="player.color"
            >
              {{ i+2 }}
            </div>
            <div
              class="character"
              :class="player.character"
            ></div>
            <div>{{ player.name }}:</div>
            <div>{{ player.score }}分</div>
            <div>最大區塊 {{ player.largestPasture }}</div>
          </div>
        </div>
      </div>
      <div
        class=" text-[#982000] text-xl mt-[60px] rounded-full py-[10px] px-7 cursor-pointer pointer-events-auto bg-gradient-to-b from-[#FFFBD6] to-[#FFBA39] border border-[#FFDE7B] shadow-confirm "
        @click="handlebackRoom"
      >
        回到房間
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
  .score-board {
    background: linear-gradient(180deg, #D6EDF5 0%, #84DDF6 100%);
    border: 4px solid #B2EFFF;
    box-shadow: 0px 20px 0px 0px #27B8E0;
    border-radius: 40px;
  }
  .first-place-player {
    display: flex;
    justify-content: center;
    position: absolute;
    left: 48px;
    top: 60px;
    .bg {
      width: 280px;
      height: 332px;
      gap: 0px;
      border-radius: 20px;
      opacity: 0px;
      background: linear-gradient(180deg, rgba(39, 184, 224, 0.9) 0%, rgba(39, 184, 224, 0) 100%);
    }
    .shine {
      position: absolute;
      z-index: 1;
      top: -22px;
      left: -48px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      width: 376px;
      height: 376px;
      background-image: url('@/assets/images/shine.svg');
    }
    .character {
      position: absolute;
      z-index: 1;
      top: 47px;
      left: 21px;
      width: 238px;
      height: 238px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      &.tux{
        background-image: url('@/assets/images/gameover/ranking-win-1.png');
      }
      &.gunter{
        background-image: url('@/assets/images/gameover/ranking-win-2.png');
      }
      &.abc{
        background-image: url('@/assets/images/gameover/ranking-win-3.png');
      }
      &.sin{
        background-image: url('@/assets/images/gameover/ranking-win-4.png');
      }
    }
    .rank {
      position: absolute;
      z-index: 1;
      top: 4px;
      left: -40px;
      width: 100px;
      height: 100px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      &.blue{
        background-image: url('@/assets/images/rank-blue-large.png');
      }
    }
    .score-container{
      position: absolute;
      z-index: 1;
      bottom: -12px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 4px;
      .name{
        background: #0F2A30E5;
        padding: 8px 16px 8px 16px;
        border-radius: 20px;
        opacity: 0px;
        color: #fff;
        font-size: 18px;
        font-weight: 700;
        line-height: 26.64px;
        letter-spacing: 0.05em;
        text-align: center;
        width: 100%;
      }
      .score{
        display: flex;
        align-items: baseline;
        font-size: 18px;
        font-weight: 300;
        color: #006989;
        gap: 4px;
        :first-child{
          font-size: 28px;
          font-weight: 700;
        }
        :last-child{
          font-size: 20px;
          font-weight: 500;
        }
      }
    }
  }
  .game-over-modal-container {
    position: relative;
    .title {
      z-index: 1;
      position: absolute;
      width: 454px;
      height: 80px;
      top: -40px;
      background-image: url('@/assets/images/gameover-title.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }
    .snow-left {
      z-index: 1;
      position: absolute;
      width: 182px;
      height: 84px;
      top: -28px;
      left: -16px;
      background-image: url('@/assets/images/deco-snow-left.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }
    .snow-right {
      z-index: 1;
      position: absolute;
      width: 206px;
      height: 84px;
      top: -28px;
      right: -16px;
      background-image: url('@/assets/images/deco-snow-right.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }
  }
  .other-player-container {
    position: absolute;
    right: 48px;
    width: 392px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    .banner {
      background: linear-gradient(180deg, #FFFFFF 0%, #DAFFFF 100%);
      color: #006989;
      border-radius: 40px;
      font-size: 18px;
      font-weight: 700;
      line-height: 26.64px;
      letter-spacing: 0.05em;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 4px;
      height: 64px;
      position: relative;
      .rank {
        position: absolute;
        left: 8px;
        top: -16px;
        width: 48px;
        height: 48px;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-bottom: 4px;
        &.blue{
          background-image: url('@/assets/images/gameover/rank-blue.png');
          color: #2B9CEF
        }
        &.yellow{
          background-image: url('@/assets/images/gameover/rank-yellow.png');
          color: #FF9200
        }
        &.green{
          background-image: url('@/assets/images/gameover/rank-green.png');
          color: #79BF00
        }
        &.red{
          background-image: url('@/assets/images/gameover/rank-red.png');
          color: #E75027
        }
      }
      .character {
        width: 80px;
        height: 80px;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        position: absolute;
        left: 48px;
        top: -8px;
        &.tux{
          background-image: url('@/assets/images/gameover/ranking-other-1.png');
        }
        &.gunter{
          background-image: url('@/assets/images/gameover/ranking-other-2.png');
        }
        &.abc{
          background-image: url('@/assets/images/gameover/ranking-other-3.png');
        }
        &.sin{
          background-image: url('@/assets/images/gameover/ranking-other-4.png');
        }
      }
    }
  }
</style>