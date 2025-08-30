import _ from 'lodash';
import { computed, reactive, watch } from 'vue';

const TIME_IMMEDIATE = 0;
const TIME_DELAY     = 1;
const TIME_INTERVAL  = 2;
const TIME_MANUAL    = 3; // not implemented

const STRATEGY_AUTOMATIC = 0;
const STRATEGY_ALL       = 1;
const STRATEGY_MANUAL    = 2;

const config = reactive(_.defaultsDeep(
  JSON.parse(localStorage.getItem('profit_config') || '{}'),
  {
    time: {
      type: TIME_IMMEDIATE,
      delay: 600,
      interval: 3600,
    },
    // netProfit: true, // not implemented
    // showWithProb: false, // not implemented
    strategy: {
      type: STRATEGY_AUTOMATIC,
      manualSettings: {},
    },
    expval: 3.3,
  },
));

watch(config, config => localStorage.setItem('profit_config', JSON.stringify(config)));

const activeTimePicker = computed({
  get() {
    if (config.time.type === TIME_DELAY) return config.time.delay;
    if (config.time.type === TIME_INTERVAL) return config.time.interval;
    return null;
  },
  set(value) {
    if (config.time.type === TIME_DELAY) return config.time.delay = value;
    if (config.time.type === TIME_INTERVAL) return config.time.interval = value;
    return null;
  },
});

const timeParser = computed(() => time => {
  if (config.time.type === TIME_IMMEDIATE) return time;
  if (config.time.type === TIME_DELAY) return time + config.time.delay;
  if (config.time.type === TIME_INTERVAL) return Math.ceil(time / config.time.interval) * config.time.interval;
  return 0;
});

export {
  TIME_IMMEDIATE, TIME_DELAY, TIME_INTERVAL, TIME_MANUAL,
  STRATEGY_AUTOMATIC, STRATEGY_ALL, STRATEGY_MANUAL,

  config,

  activeTimePicker,
  timeParser,
};
