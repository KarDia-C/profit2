<template>
  <Select
    v-model:value="config.time.type"
    :options="[
      {
        label: '无延迟',
        value: TIME_IMMEDIATE,
      },
      {
        label: '固定延迟',
        value: TIME_DELAY,
      },
      {
        label: '固定间隔',
        value: TIME_INTERVAL,
      },
      {
        label: '自定义（懒得写）',
        value: TIME_MANUAL,
        disabled: true,
      },
    ]"
    :dropdown-match-select-width="false"
  />
  <InputNumber
    v-if="config.time.type !== TIME_IMMEDIATE"
    v-model:value="activeTimePicker"
    :min="0"
    :max="86400"
    :formatter="value => {
      let result = value % 60;
      while ((value = parseInt(value / 60))) {
        result = value % 60 + ':' + result;
      }
      return result;
    }"
    :parser="value => value.split(':').reduce((prev, curr) => prev * 60 + parseInt(curr || '0'))"
  />
</template>

<script setup>
import { InputNumber, Select } from 'ant-design-vue';
import { activeTimePicker, config, TIME_IMMEDIATE, TIME_DELAY, TIME_INTERVAL, TIME_MANUAL } from '../Config.js';
</script>
