<script setup>

defineProps({
  text: {
    type: String,
    default: '',
    required: true,
  },
  buttonType: {
    type: String,
    required: false,
    default: 'confirm',
    validator (value) {
      if ([ 'confirm', 'cancel' ].includes(value)) {
        return value
      }
      return 'confirm'
    }
  },
  isDisabled: {
    type: Boolean,
    default: false,
    required: false,
  }
})
const emit = defineEmits([ 'onClick' ])

</script>

<template>
  <button
    :class="buttonType"
    :disabled="isDisabled"
    @click="emit('onClick')"
  >
    {{ text }}
  </button>
</template>

<style scoped>
button {
  width: 140px;
  height: 50px;
  font-size: 1.25rem;
  border-radius: 30px;
}

.confirm {
  color: #982000;
  text-shadow: 0px 0px 4px 0px #fff7ae;
  background: linear-gradient(180deg, #fffbd6 0%, #ffba39 100%);
  border-radius: 30px;
  box-shadow: 0px 4px 0px 0px #ff9200;
}

.cancel {
  color: #ffff;
  background: linear-gradient(180deg, #afb7b9 0%, #6b7375 100%);
  border: 1px solid #dbdfe0;
}
</style>