<template>
  <Select
    v-model:value="config.strategy.type"
    :options="[
      {
        label: '自动',
        value: STRATEGY_AUTOMATIC,
      },
      {
        label: '全选',
        value: STRATEGY_ALL,
      },
      {
        label: '手动',
        value: STRATEGY_MANUAL,
      },
    ]"
  />
</template>

<script setup>
import { Select } from 'ant-design-vue';
import { config, STRATEGY_AUTOMATIC, STRATEGY_ALL, STRATEGY_MANUAL } from '../Config.js';
</script>
