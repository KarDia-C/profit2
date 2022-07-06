<template>
  <Layout class="layout">
    <Layout.Header>
      <Typography.Title class="title">
        收益计算器
        <Typography.Title
          class="subtitle"
          :level="5"
        >
          --卡露蒂亚城乡结合部
        </Typography.Title>
      </Typography.Title>
    </Layout.Header>
    <Layout.Content style="padding: 0 50px">
      <Row>
        <Col :span="6">
          <Select
            v-model:value="selectedZone"
            :options="zoneOptions"
            :loading="!zoneOptions.length"
            :disabled="!zoneOptions.length"
          />
        </Col>
        <Col :span="6">
          <TimeSelector />
        </Col>
        <Col :span="2">
          <TwoLineText
            major-text="经验价值："
            minor-text="推荐4.8~5.2"
          />
        </Col>
        <Col :span="6">
          <Slider v-model:value="config.expval" :min="1.5" :max="10" :step="0.1" />
        </Col>
        <Col :span="4">
          <InputNumber v-model:value="config.expval" :min="1.5" :max="10" />
        </Col>
      </Row>

      <Row>
        <Col :span="24">
          <ColorBarTable
            v-model:selection="getCurrentSelection"
            :data-source="resolvedEggStats"
            :columns="columns"
            :selection-title="h(StrategySelector)"
            :selection-disabled="config.strategy.type !== STRATEGY_MANUAL"
            :summary="getCurrentSummary"
          />
        </Col>
      </Row>
    </Layout.Content>
  </Layout>
</template>

<script setup>
import { Col, InputNumber, Layout, Select, Slider, Row, Typography } from 'ant-design-vue';
import axios from 'axios';
import _ from 'lodash';
import { computed, h, onMounted, ref, shallowRef } from 'vue';
import { config, timeParser, STRATEGY_AUTOMATIC, STRATEGY_ALL, STRATEGY_MANUAL} from './Config.js';
import ColorBarTable from './components/ColorBarTable.vue';
import StrategySelector from './components/StrategySelector.vue';
import TimeSelector from './components/TimeSelector.vue';
import TwoLineText from './components/TwoLineText.vue';

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '概率*',
    tooltip: h('span', { innerHTML: '概率已包含保底：<br>一星74.820%<br>二星24.607%<br>三星0.573%' }),
    dataIndex: 'probStr',
    sorter: (a, b) => a.prob - b.prob,
  },
  {
    title: h(TwoLineText, { majorText: '孵化时间', minorText: '原始时间' }),
    dataIndex: 'timeStr',
    sorter: (a, b) => a.time - b.time,
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '派遣金币',
    dataIndex: 'money',
    sorter: (a, b) => a.money - b.money,
  },
  {
    title: '强化经验',
    dataIndex: 'exp',
    sorter: (a, b) => a.exp - b.exp,
  },
  {
    title: '评分*',
    tooltip: '=max(派遣金币, 强化经验 * 经验价值) / 孵化时间',
    dataIndex: 'rating',
    sorter: (a, b) => a.rating - b.rating,
  },
  {
    title: '效率/小时',
    dataIndex: 'efficiency',
  },
];

const zoneData = shallowRef(null);
const selectedZone = ref('1');
let eggsData = null;

onMounted(() => {
  axios
    .get('eggs.json')
    .then(response => {
      eggsData = response.data.eggs;
      let result = {};
      for (let zoneId in response.data.maps) {
        let zone = response.data.maps[zoneId];
        let eggs = [];

        for (let star in zone.weight) {
          const prob = [.7482, .24607, .00573][parseInt(star) - 1];
          const weightSum = _.sum(_.values(zone.weight[star]));
          Object.entries(zone.weight[star]).forEach(([key, weight]) => {
            eggs.push({
              key,
              ...eggsData[key],
              prob: weight / weightSum * prob,
            });
          });
        }

        result[zoneId] = {
          ...response.data.maps[zoneId],
          eggs,
        };
        delete result[zoneId].weight;
      }
      zoneData.value = result;
    });
});

const zoneOptions = computed(() => _.toPairs(zoneData.value).map(([id, info]) => ({
  value: id,
  label: `${info.name} (${getSummary(id).rating})`,
})));

const formatTime = seconds => {
  let hours, minutes;
  const sep = raw => [Math.floor(raw / 60), raw % 60];
  [minutes, seconds] = sep(seconds);
  [hours, minutes] = sep(minutes);
  const lp = num => num.toString().padStart(2, '0');
  return `${lp(hours)}:${lp(minutes)}:${lp(seconds)}`;
};

const resolvedEggStats = computed(() => {
  if (zoneData.value === null) return [];
  let calcTime, expval;
  let result = zoneData.value[selectedZone.value].eggs.map(egg => ({
      ...egg,
      calcTime: calcTime = timeParser.value(egg.time),
      expval: expval = egg.exp * config.expval,
      rating: _.max([egg.money, expval]) / calcTime * 60,
  }));
  const maxRating = _.maxBy(result, o => o.rating).rating;
  result.forEach(egg => {
    egg.width = egg.rating / maxRating;
    egg.rating = egg.rating.toFixed(2);
    egg.timeStr = h(TwoLineText, { majorText: formatTime(egg.calcTime), minorText: formatTime(egg.time)});
    egg.probStr = (egg.prob * 100).toFixed(3) + '%';
    egg.color = egg.money == egg.expval ? '#ffff80' : egg.money > egg.expval ? '#ff8080' : '#8080ff';
    egg.efficiency = egg.money >= egg.expval ? (egg.money / egg.calcTime * 3600).toFixed(2) + '金币' : (egg.exp / egg.calcTime * 3600).toFixed(2) + '经验';
  });
  return result;
});

const getSelectionAutomatically = zone => {
  const eggs = zoneData.value[zone].eggs.map(egg => ({
    ...egg,
    value: _.max([egg.money, egg.exp * config.expval]),
    time: timeParser.value(egg.time),
  })).sort((a, b) => b.value / b.time - a.value / a.time);

  let profit = -zoneData.value[zone].price * 10 / 11, time = 0; // 11 eggs @ 10 x price
  const result = [];

  for (let egg of eggs) {
    if (profit * egg.time <= egg.value * time) { // profit / time <= egg.value / egg.time
      profit += egg.value * egg.prob;
      time += egg.time * egg.prob;
      result.push(egg.key);
    }
  }
  return result;
};

const getSelectionAll = zone => zoneData.value[zone].eggs.map(egg => egg.key);

const getSelectionManually = zone => {
  if (config.strategy.manualSettings[zone] === undefined) config.strategy.manualSettings[zone] = getSelectionAll(zone);
  return config.strategy.manualSettings[zone];
};

const getSelection = zone => {
  if (zoneData.value === null) return [];
  if (zone === undefined) zone = selectedZone.value;
  if (config.strategy.type === STRATEGY_AUTOMATIC) return getSelectionAutomatically(zone);
  if (config.strategy.type === STRATEGY_ALL) return getSelectionAll(zone);
  if (config.strategy.type === STRATEGY_MANUAL) return getSelectionManually(zone);
  return [];
};

const getCurrentSelection = computed({
  get: getSelection,
  set: value => {
    if (config.strategy.type === STRATEGY_MANUAL) {
      config.strategy.manualSettings[selectedZone.value] = value;
    }
  },
});

const getSummary = zone => {
  if (zone === undefined) zone = selectedZone.value;
  const selection = new Set(getSelection(zone));
  const eggs = zoneData.value?.[zone].eggs ?? [];

  let money = -(zoneData.value?.[zone].price ?? 0) * 10 / 11, exp = 0, time = 0, prob = 0;
  eggs.forEach(egg => {
    if (selection.has(egg.key)) {
      if (egg.money >= egg.exp * config.expval)
        money += egg.money * egg.prob;
      else
        exp += egg.exp * egg.prob;
      time += timeParser.value(egg.time) * egg.prob;
      prob += egg.prob;
    }
  });

  return {
    name: '总计',
    probStr: (prob * 100).toFixed(3) + '%',
    timeStr: formatTime(Math.round(time)) + '/抽',
    money: money.toFixed(2) + '/抽',
    exp: exp.toFixed(2) + '/抽',
    rating: time ? ((money + exp * config.expval) / time * 60).toFixed(3) : '--',
    efficiency: time ? `${(money / time * 3600).toFixed(2)}金币<br>${(exp / time * 3600).toFixed(2)}经验` : '--',
  };
};

const getCurrentSummary = computed(getSummary);

</script>

<style lang="less" scoped>
@import "ant-design-vue/lib/style/themes/default";

.layout {
  height: 100%;
}

.ant-layout-header {
  display: flex;
  align-items: center;
}

h1.ant-typography.title {
  color: @text-color-dark;
  margin: 0;
}

h5.ant-typography.subtitle {
  color: @text-color-secondary-dark;
  display: inline;
  margin: 0;
  vertical-align: bottom;
}

.ant-col {
  margin-top: 16px;
}
</style>
