<script setup>

const props = defineProps({
  room: {
    type: Object,
    default: () => {},
    required: true,
  },
})
const roomStatus = {
  'waiting': '開放中',
  'starting': '即將開始',
  'playing': '進行中',
}
</script>

<template>
  <div
    class="room-box flex flex-col items-center text-text relative"
    :class="{ active: room.status=== 'waiting' }"
  >
    <div class="absolute w-[110px] h-[45px] box-status">
      {{ roomStatus[room.status] }}
    </div>
    
    <div class="grow flex justify-center items-center text-2xl font-medium mt-5">
      {{ props.room.name }}
    </div>
    <div class="grow-0 shrink-0 px-5 pb-5">
      {{ props.room.players.length }} / 4
    </div>
  </div>
</template>

<style scoped>
.room-box {
  width: 260px;
  height: 200px;
  cursor: pointer;
  background: linear-gradient(180deg, #ffffff 0%, #daffff 100%);
  border-color: #ffffff;
  border-width: 4px;
  border-radius: 24px;

  & .box-status {
    top: -22px;
    left: 50%;
    font-size: 20px;
    line-height: 45px;
    text-align: center;
    text-shadow: 0px 0px 4px 0px #ffd6d6;
    background: #dbdfe0;
    border-radius: 22px;
    transform: translateX(-50%);
  }

  &.active {
    border-color: #83ffdc;

    & .box-status {
      background: #83ffdc;
    }
  }
}
</style>