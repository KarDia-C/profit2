<template>
  <Table
    :columns="columns"
    :custom-row="
      record => ({
        style: {
          background: `linear-gradient(120deg, ${record.color}, transparent ${
            record.width * 100
          }%, transparent)`,
        },
      })
    "
    :row-selection="{
      columnTitle: selectionTitle,
      getCheckboxProps: _ => ({ disabled: selectionDisabled }),
      selectedRowKeys: selection,
      columnWidth: '104px',
      // eslint-disable-next-line vue/no-mutating-props
      onChange: newSelected => $emit('update:selection', newSelected),
    }"

    :show-sorter-tooltip="false"
    :sort-directions="['descend', 'ascend']"
    :pagination="false"
    bordered
    :scroll="{
      x: '100%',
      y: 'calc(100vh - 260px)',
    }"
  >
    <template #headerCell="{ column }">
      <template v-if="column.tooltip">
        <Tooltip
          :title="column.tooltip"
        >
          {{ column.title }}
        </Tooltip>
      </template>
    </template>

    <template #summary>
      <Table.Summary fixed>
        <Table.Summary.Row>
          <Table.Summary.Cell />
          <Table.Summary.Cell v-for="{dataIndex} in props.columns" :key="dataIndex">
            <div v-html="props.summary[dataIndex]" />
          </Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    </template>
  </Table>
</template>

<script setup>
import { Table, Tooltip } from 'ant-design-vue';

const props = defineProps({
  columns: Array,
  selectionDisabled: Boolean,
  selection: {
    type: Array,
    default: () => [],
  },
  selectionTitle: Object,
  summary: Object,
})

defineEmits(['update:selection']);
</script>

<style scoped>
:deep() td {
  background: unset !important;
  border-color: #f0f0f0 !important;
}
:deep() tr:hover td {
  background: #00000005 !important;
}
:deep() .ant-table-cell {
  padding: 4px 16px !important;
}
</style>
