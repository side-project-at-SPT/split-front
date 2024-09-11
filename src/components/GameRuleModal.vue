<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits([ 'update:modelValue' ])

const showRuleModal = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <div
    v-if="showRuleModal"
    class="fixed top-0 left-0 w-svw h-dvh bg-black bg-opacity-50 flex items-center justify-center z-20 selection:bg-blue-700 selection:text-white"
  >
    <div class="relative flex flex-col gap-2 bg-ice p-10">
      <button
        class="close-button absolute top-2 right-3"
        @click="showRuleModal = false"
      >
        &times;
      </button>
      <div>
        <div class="text-lg">
          遊戲目標
        </div>
        <div class="p-2">
          移動你的企鵝，藉由阻擋對手移動，佔領最大範圍的遊玩區域。
        </div>
      </div>
      <div>
        <div class="text-lg">
          遊戲準備
        </div>
        <div class="p-2">
          每位玩家放置各自的企鵝堆，置於遊戲區域外圍的其中一塊冰原板塊。每位玩家由起始的冰原版塊行動，將企鵝散播至其他區域。
        </div>
      </div>
      <div>
        <div class="text-lg">
          遊戲方法
        </div>
        <div class="p-2">
          輪到你時，你必須採取以下的動作
          <div class="p-2">
            <div>1. 將你的企鵝堆分成兩堆(你可以決定每一堆企鵝的數量，但是每一堆中，至少有一隻企鵝)</div>
            <div>2. 離開你的起始企鵝堆，直線移動你的新企鵝堆直到：</div>
            <div class="p-2">
              a)抵達其他的企鵝堆
              b)無法繼續往前走(抵達遊玩區域的邊緣)
            </div>
          </div>

          <div class="bg-green-200 p-2">
            重要：
            <ol class="list-decimal px-8 py-2">
              <li>每次輪到你移動時，至少需移動1隻企鵝</li>
              <li>企鵝只能直線移動</li>
              <li>在同一塊冰原圖板上，只能有一堆企鵝</li>
              <li>無法合併或跳過其他企鵝(包含自己的)</li>
            </ol>
          </div>
        </div>
      </div>
      <div>
        <div class="text-lg">
          獲勝條件
        </div>
        <div class="p-2">
          <div>
            當所有玩家都無法移動企鵝時，佔領最多冰原的玩家獲勝！
          </div>
          <div>
            總冰原面積平手時，則相連的冰原面積最大的玩家獲勝！
          </div>
        </div>
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
</style>