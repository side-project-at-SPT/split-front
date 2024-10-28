<script setup>
import { ref } from 'vue'
import DefaultButton from './DefaultButton.vue'
import EditPenguin from '@/assets/images/dialog/editName.svg'
import LeavePenguin from '@/assets/images/dialog/closeRoom.svg'

const props = defineProps({
  title: {
    type: String,
    required: true,
    default: ''
  },
  inputDefaultValue: {
    type: String,
    required: false,
    default: ''
  },
  isEdit: {
    type: Boolean,
    required: false,
    default: false,
  },
  contentText: {
    type: String,
    require: false,
    default: '是否確認離開這個房間？'
  },
  submitButtonText: {
    type: String,
    required: false,
    default: '確認修改'
  }
})
const emits = defineEmits([ 'onCheck' ])

const newName = ref(props.inputDefaultValue)
const showChangeNameModal = defineModel({ type: Boolean })

</script>

<template>
  <div
    class="absolute w-svw h-dvh dialogBackground flex items-center justify-center z-40 top-0"
  >
    <div class="w-[296px] h-[222px] flex flex-col items-center justify-between relative">
      <div class="text-center text-white text-3xl font-medium">
        {{ title }}
      </div>
      <template v-if="isEdit">
        <input
          v-model="newName"
          class="w-full h-12 rounded-full border bg-transparent  placeholder:text-gray-400 text-center text-[#006989] focus:outline-none text-xl font-medium bg-white"
          :placeholder="'請輸入'+title.replace('修改','')"
        >
        <div class="flex gap-2">
          <DefaultButton
            :text="'取消'"
            :button-type="'cancel'"
            @on-click="showChangeNameModal = false, newName = ''"
          />
          <DefaultButton
            :text="submitButtonText"
            :button-type="'confirm'"
            @on-click="()=>emits('onCheck',newName)"
          />
        </div>
      </template>
      <template v-else>
        <p class="text-center text-lg font-normal text-white px-8">
          {{ contentText }}
        </p>
        <div class="flex gap-2">
          <DefaultButton
            :text="submitButtonText"
            :button-type="'cancel'"
            @on-click="()=>emits('onCheck')"
          />
          <DefaultButton
            :text="'取消'"
            :button-type="'confirm'"
            @on-click="showChangeNameModal = false"
          />
        </div>
      </template>
      <div
        class="absolute w-80 h-80 top-[-49px] flex"
        :class="isEdit?'left-[296px] justify-start':'right-[296px] justify-end'"
      >
        <img
          class="w-auto h-auto"
          :src="isEdit? EditPenguin:LeavePenguin"
          alt=""
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialogBackground {
  background: rgba(15, 42, 48, .9);
}
</style>