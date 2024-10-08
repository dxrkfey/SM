<template>
  <div class="h-full flex flex-col bg-gray-100 p-4">
    <header class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">Dashboard</h1>
    </header>

    <div class="flex-grow grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-4">
      <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        <div class="rounded-lg shadow-md overflow-hidden">
          <img src="../assets/smoke.jpg" class="object-cover w-full h-full" alt="Smoke Image" />
        </div>

        <div class="grid grid-rows-2 gap-4">
          <div class="bg-red-500 text-white rounded-lg flex items-center justify-center p-4 shadow-md">
            <h2 class="text-2xl font-bold tracking-wide">BLACK SMOKE</h2>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-md flex flex-col items-center text-center">
            <h2 class="text-gray-700 font-medium text-xl mb-4">Duration of Smoke</h2>
            <div class="flex justify-center items-center space-x-6">
              <div class="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                <p class="text-2xl font-bold text-gray-800">{{ latestData.blackTimeSmoke }}</p>
                <p class="text-sm text-gray-500">Minutes</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                <p class="text-2xl font-bold text-gray-800">{{ latestData.blackTimeSmokeSeconds }}</p>
                <p class="text-sm text-gray-500">Seconds</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="grid grid-rows-2 gap-4">
        <div class="bg-white rounded-lg p-6 shadow-md flex flex-col items-center max-h-48">
          <h2 class="text-gray-700 font-semibold text-xl mb-5">COUNT</h2>
          <div class="flex flex-col items-center">
            <p class="text-2xl font-bold text-gray-800">{{ latestData.blackTimeSmoke }}</p>
            <span class="text-gray-500 text-lg font-medium mt-5">Times</span>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md flex flex-col items-center max-w-full max-h-[256px]">
          <h2 class="text-gray-700 font-medium text-xl mb-4">Ratio</h2>
          <div class="w-full h-full flex items-center justify-center">
            <PieChart chart_id="pie-chart" :data="[{ name: 'Black Smoke', y: 500 }, { name: 'White Smoke', y: 364 }]" style="width: 100%; height: 100%;"/>
          </div>
        </div>
      </div>
    </div>

    <div class="py-6">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6">
        <div class="space-x-4 mb-4 md:mb-0">
          <button @click="tabBar = 'Graph'"
            :class="tabBar === 'Graph' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'"
            class="px-6 py-2 rounded-full shadow-sm hover:bg-blue-600 hover:text-white transition duration-300 text-sm">
            Graph
          </button>
          <button @click="tabBar = 'Table'"
            :class="tabBar === 'Table' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'"
            class="px-6 py-2 rounded-full shadow-sm hover:bg-blue-600 hover:text-white transition duration-300 text-sm">
            Table
          </button>
        </div>

        <div class="flex items-center space-x-4">
          <div class="relative">
            <input ref="startDateRef" name="start" type="text"
              class="bg-white border border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-32 p-2"
              placeholder="Start Date" v-model="startDate" />
          </div>
          <span class="text-gray-500 text-sm">to</span>
          <div class="relative">
            <input ref="endDateRef" name="end" type="text"
              class="bg-white border border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-32 p-2"
              placeholder="End Date" v-model="endDate" />
          </div>
          <button @click="fetchLatest"
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 text-sm">
            Search
          </button>
          <button @click="fetchLatest"
            class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300 text-sm">
            Latest
          </button>
        </div>
      </div>

      <div v-show="tabBar === 'Graph'" class="bg-white rounded-lg p-6 shadow-md">
        <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
          <div class="flex flex-col">
            <h2 class="text-lg font-semibold mb-4 text-gray-700">Black Smoke Times</h2>
            <div class="w-full h-64">
              <LineChart2 :title="''" :data="chartDataSmoke" :chart_id="'BlackTimeSmokeChart'" />
            </div>
            <h2 class="text-lg font-semibold mt-8 mb-4 text-gray-700">Black Smoke Status</h2>
            <div class="w-full h-64">
              <LineChart2 :title="''" :data="chartDataStatus" :chart_id="'BlackTimeStatusChart'" />
            </div>
          </div>

          <div class="flex flex-col">
            <h2 class="text-lg font-semibold mb-4 text-gray-700">Average Times</h2>
            <div class="grid grid-cols-1 gap-6">
              <div class="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                <div class="w-full h-32">
                  <PieChart chart_id="pie-chart-day"
                    :data="[{ name: 'Black Smoke', y: 30 }, { name: 'White Smoke', y: 70 }]" style="height: 128px;"/>
                </div>
                <p class="mt-2 text-gray-600 text-m font-semibold">Per Day</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                <div class="w-full h-32">
                  <PieChart chart_id="pie-chart-month"
                    :data="[{ name: 'Black Smoke', y: 25 }, { name: 'White Smoke', y: 75 }]" />
                </div>
                <p class="mt-2 text-gray-600 text-m font-semibold">Per Month</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                <div class="w-full h-32">
                  <PieChart chart_id="pie-chart-year"
                    :data="[{ name: 'Black Smoke', y: 20 }, { name: 'White Smoke', y: 80 }]" />
                </div>
                <p class="mt-2 text-gray-600 text-m font-semibold">Per Year</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="tabBar === 'Table'" class="bg-white rounded-lg shadow-md mt-6">
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-gray-700 font-semibold text-lg">Black Smoke Data</h2>
          <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300">
            Export Data
          </button>
        </div>
        <div class="">
          <Table :data="resultHis" />
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue';
import LineChart2 from '../components/LineChart.vue';
import Table from '../components/Table.vue';
import PieChart from '../components/PieChart.vue';

const formatOptions: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Bangkok',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};

const toBangkokTimeString = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', formatOptions).format(date).replace(',', '');
};

const bounds = reactive({
  blackTimeSmokeLower: 50,
  blackTimeSmokeUpper: 100,
});

interface DataItem {
  no: number; // Row number
  blackTimeSmoke: number;
  blackTimeSmokeSeconds: number;
  blackTimeStatus: string; // "Black Smoke" or "White Smoke"
  date_time: string;
}

interface Result {
  data: DataItem[];
}

interface ChartData {
  categories: string[];
  series: any[];
}

const resultHis = ref<Result>({
  data: [],
});

const chartDataSmoke = ref<ChartData>({
  categories: [],
  series: [],
});

const chartDataStatus = ref<ChartData>({
  categories: [],
  series: [],
});

const latestData = ref<DataItem>({
  no: 1, // Initialize with first row number
  blackTimeSmoke: 0,
  blackTimeSmokeSeconds: 0,
  blackTimeStatus: 'Black Smoke', // Default status
  date_time: toBangkokTimeString(new Date()),
});

const startDate = ref(toBangkokTimeString(new Date(new Date().getTime() - 24 * 60 * 60 * 1000)));
const endDate = ref(toBangkokTimeString(new Date()));

const tabBar = ref('Graph');

const formatDate = (dateTime: string): string => {
  const date = new Date(dateTime);
  return date.toLocaleDateString('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatTime = (dateTime: string): string => {
  const date = new Date(dateTime);
  return date.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const fetchData = async (startDate: string, endDate: string) => {
  const dummyData: DataItem[] = [];

  const startTime = new Date(startDate).getTime();
  const endTime = new Date(endDate).getTime();
  const interval = (endTime - startTime) / 10;

  for (let i = 0; i <= 10; i++) {
    const timestamp = new Date(startTime + interval * i);
    dummyData.push({
      no: i + 1, // Assign row number
      blackTimeSmoke: Math.floor(Math.random() * 100),
      blackTimeSmokeSeconds: Math.floor(Math.random() * 60),
      blackTimeStatus: Math.random() > 0.5 ? 'Black Smoke' : 'White Smoke', 
      date_time: toBangkokTimeString(timestamp),
    });
  }

  resultHis.value.data = dummyData;

  const categories = dummyData.map(item => item.date_time);
  const seriesSmoke = {
    type: 'line',
    name: 'Time of Smokes(mins)',
    data: dummyData.map(item => ({
      x: new Date(item.date_time).getTime(),
      y: item.blackTimeSmoke,
    })),
  };

  const seriesStatus = {
    type: 'line',
    name: 'Smoke Status',
    data: dummyData.map(item => ({
      x: new Date(item.date_time).getTime(),
      y: item.blackTimeStatus === 'Black Smoke' ? 1 : 0,
    })),
  };

  chartDataSmoke.value = { categories, series: [seriesSmoke] };
  chartDataStatus.value = { categories, series: [seriesStatus] };
};

const fetchLatestData = async () => {
  const newEntry: DataItem = {
    no: resultHis.value.data.length + 1, // Increment row number
    blackTimeSmoke: Math.floor(Math.random() * 100),
    blackTimeSmokeSeconds: Math.floor(Math.random() * 60),
    blackTimeStatus: Math.random() > 0.5 ? 'Black Smoke' : 'White Smoke', // Updated status
    date_time: toBangkokTimeString(new Date()),
  };

  // Append the new entry to the table data
  resultHis.value.data.push(newEntry);

  // Update charts with the new data
  await fetchData(startDate.value, endDate.value);
};

const checkStatus = () => {
  const latest = latestData.value;
  if (!latest) return { smokeStatus: 'bg-red', status: 'bg-red' };

  const smokeStatus =
    latest.blackTimeSmoke >= bounds.blackTimeSmokeLower && latest.blackTimeSmoke <= bounds.blackTimeSmokeUpper
      ? 'bg-green-500'
      : 'bg-red-500';
  const status = latest.blackTimeStatus === 'Black Smoke' ? 'bg-black text-white' : 'bg-white text-black border border-gray-300';

  return { smokeStatus, status };
};

const status = computed(() => checkStatus());

const fetchLatest = async () => {
  await fetchLatestData();
};

onMounted(async () => {
  await fetchLatestData();
});
</script>
