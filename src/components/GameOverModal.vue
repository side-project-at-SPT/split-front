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
            class="flex items-baseline justify-center gap-2 banner"
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
            <div class="name">
              {{ player.name }}
            </div>
            <div class="flex gap-1 items-baseline">
              <div class="text-xl font-bold">
                {{ player.score }}
              </div>
              <div>分</div>
            </div>
            <div class="flex gap-1 items-baseline">
              <div>最大區塊</div>
              <div class="font-medium">
                {{ player.largestPasture }}
              </div>
            </div>
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

  .score-board {
    background: linear-gradient(180deg, #d6edf5 0%, #84ddf6 100%);
    border: 4px solid #b2efff;
    border-radius: 40px;
    box-shadow: 0px 20px 0px 0px #27b8e0;
  }

  .first-place-player {
    position: absolute;
    top: 60px;
    left: 48px;
    display: flex;
    justify-content: center;

    .bg {
      gap: 0px;
      width: 280px;
      height: 332px;
      background: linear-gradient(180deg, rgba(39, 184, 224, .9) 0%, rgba(39, 184, 224, 0) 100%);
      border-radius: 20px;
      opacity: 0px;
    }

    .shine {
      position: absolute;
      top: -22px;
      left: -48px;
      z-index: 1;
      width: 376px;
      height: 376px;
      background-image: url('@/assets/images/shine.svg');
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }

    .character {
      position: absolute;
      top: 47px;
      left: 21px;
      z-index: 1;
      width: 238px;
      height: 238px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;

      &.tux {
        background-image: url('@/assets/images/gameover/ranking-win-1.png');
      }

      &.gunter {
        background-image: url('@/assets/images/gameover/ranking-win-2.png');
      }

      &.abc {
        background-image: url('@/assets/images/gameover/ranking-win-3.png');
      }

      &.sin {
        background-image: url('@/assets/images/gameover/ranking-win-4.png');
      }
    }

    .rank {
      position: absolute;
      top: 4px;
      left: -40px;
      z-index: 1;
      width: 100px;
      height: 100px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;

      &.blue {
        background-image: url('@/assets/images/gameover/rank-blue-large.png');
      }

      &.yellow {
        background-image: url('@/assets/images/gameover/rank-yellow-large.png');
      }

      &.green {
        background-image: url('@/assets/images/gameover/rank-green-large.png');
      }

      &.red {
        background-image: url('@/assets/images/gameover/rank-red-large.png');
      }
    }

    .score-container {
      position: absolute;
      bottom: -12px;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
      justify-content: center;

      .name {
        width: 100%;
        padding: 8px 16px 8px 16px;
        font-size: 18px;
        font-weight: 700;
        line-height: 26.64px;
        color: #fff;
        text-align: center;
        letter-spacing: .05em;
        background: #0f2a30e5;
        border-radius: 20px;
        opacity: 0px;
      }

      .score {
        display: flex;
        gap: 4px;
        align-items: baseline;
        font-size: 18px;
        font-weight: 300;
        color: #006989;

        :first-child {
          font-size: 28px;
          font-weight: 700;
        }

        :last-child {
          font-size: 20px;
          font-weight: 500;
        }
      }
    }
  }

  .game-over-modal-container {
    position: relative;

    .title {
      position: absolute;
      top: -40px;
      z-index: 1;
      width: 454px;
      height: 80px;
      background-image: url('@/assets/images/gameover/gameover-title.png');
      background-repeat: no-repeat;
      background-position: center;
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
  }

  .other-player-container {
    position: absolute;
    right: 48px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    width: 392px;

    .banner {
      position: relative;
      display: flex;
      gap: 4px;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      font-size: 14px;
      font-weight: 300;
      padding-left: 128px;
      padding-right: 20px;
      color: #006989;
      letter-spacing: .05em;
      background: linear-gradient(180deg, #ffffff 0%, #daffff 100%);
      border-radius: 40px;

      .rank {
        position: absolute;
        top: -16px;
        left: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        padding-bottom: 4px;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;

        &.blue {
          color: #2b9cef;
          background-image: url('@/assets/images/gameover/rank-blue.png');
        }

        &.yellow {
          color: #ff9200;
          background-image: url('@/assets/images/gameover/rank-yellow.png');
        }

        &.green {
          color: #79bf00;
          background-image: url('@/assets/images/gameover/rank-green.png');
        }

        &.red {
          color: #e75027;
          background-image: url('@/assets/images/gameover/rank-red.png');
        }
      }

      .character {
        position: absolute;
        top: -8px;
        left: 48px;
        width: 80px;
        height: 80px;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;

        &.tux {
          background-image: url('@/assets/images/gameover/ranking-other-1.png');
        }

        &.gunter {
          background-image: url('@/assets/images/gameover/ranking-other-2.png');
        }

        &.abc {
          background-image: url('@/assets/images/gameover/ranking-other-3.png');
        }

        &.sin {
          background-image: url('@/assets/images/gameover/ranking-other-4.png');
        }
      }

      .name {
        font-size: 16px;
        font-weight: 500;
        line-height: 23.68px;
        letter-spacing: 0.05em;
        width:104px;
        flex-shrink: 0;
        text-align: center;
      }
    }
  }
</style>