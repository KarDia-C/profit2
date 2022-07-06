<template>
  <span>{{ majorText }}</span>
  <br>
  <span class="secondary">{{ minorText }}</span>
</template>

<script setup>
defineProps({
  majorText: String,
  minorText: String,
})
</script>

<style lang="less" scoped>
@import "ant-design-vue/lib/style/themes/default";

.secondary {
  color: @text-color-secondary;
  font-size: 12px;
}
</style>
