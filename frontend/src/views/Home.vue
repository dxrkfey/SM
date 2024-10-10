<template>
  <div class="h-full flex flex-col bg-gray-100 p-4">
    <header class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">Dashboard</h1>
    </header>

    <div class="flex-grow grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-4">
      <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        <!-- Image Section -->
        <div class="rounded-lg shadow-md overflow-hidden">
          <img :src="selectedSmoke?.imageUrl" class="object-cover w-full h-full" />
        </div>

        <!-- Status and Duration Section -->
        <div class="grid grid-rows-2 gap-4">
          <!-- Status Indicator -->
          <div :class="['rounded-lg flex items-center justify-center p-4 shadow-md', status.status]">
            <h2 class="text-2xl font-bold tracking-wide">
              {{ selectedSmoke?.Status === 1 ? 'BLACK SMOKE' : 'WHITE SMOKE' }}
            </h2>
          </div>

          <!-- Duration of Smoke -->
          <div class="bg-white rounded-lg p-6 shadow-md flex flex-col items-center text-center">
            <h2 class="text-gray-700 font-medium text-xl mb-4">Duration of Smoke</h2>
            <div class="flex justify-center items-center space-x-6">
              <div class="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                <p class="text-2xl font-bold text-gray-800">
                  {{ selectedSmoke?.TimeOfSmoke || 0 }}
                </p>
                <p class="text-sm text-gray-500">Minutes</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                <p class="text-2xl font-bold text-gray-800">0</p>
                <p class="text-sm text-gray-500">Seconds</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Counts and First Pie Chart -->
      <div class="grid grid-rows-2 gap-4">
        <!-- Counts Section -->
        <div class="bg-white rounded-lg p-6 shadow-md flex flex-col items-center max-h-48">
          <h2 class="text-gray-700 font-semibold text-xl mb-5">COUNT</h2>
          <div class="flex flex-col items-center">
            <p class="text-2xl font-bold text-gray-800">{{ blackCount }}</p>
            <span class="text-xl font-bold text-gray-500 mt-6">times</span>
          </div>
        </div>

        <!-- First Pie Chart -->
        <div class="bg-white rounded-lg p-6 shadow-md flex flex-col items-center max-w-full max-h-[256px]">
          <h2 class="text-gray-700 font-medium text-xl mb-4">Today Ratio</h2>
          <div class="w-full h-full flex items-center justify-center">
            <PieChart :data="todayRatioData" style="width: 100%; height: 100%;" />
          </div>
        </div>
      </div>
    </div>

    <!-- Graph and Table Section -->
    <div class="py-6">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6">
        <!-- Tab Bar -->
        <div class="space-x-4 mb-4 md:mb-0">
          <button @click="setTab('Graph')"
            :class="['px-6 py-2 rounded-full shadow-sm', tabBar === 'Graph' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500']">
            Graph
          </button>
          <button @click="setTab('Table')"
            :class="['px-6 py-2 rounded-full shadow-sm', tabBar === 'Table' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500']">
            Table
          </button>
        </div>

        <!-- Date Filters and Buttons -->
        <div class="flex items-center space-x-4">
          <div class="relative">
            <input name="start" type="date" class="bg-white border border-gray-300 text-sm rounded-md w-32 p-2"
              v-model="startDate" />
          </div>
          <span class="text-gray-500 text-sm">to</span>
          <div class="relative">
            <input name="end" type="date" class="bg-white border border-gray-300 text-sm rounded-md w-32 p-2"
              v-model="endDate" />
          </div>
          <button @click="fetchFilterData"
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition text-sm">
            Search
          </button>
          <button @click="fetchLatest"
            class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition text-sm">
            Latest
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div>
        <!-- Graph Section -->
        <div v-if="tabBar === 'Graph'" class="bg-white rounded-lg p-6 shadow-md">
          <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
            <div class="flex flex-col">
              <h2 class="text-lg font-semibold mb-4 text-gray-700">Black Smoke Times</h2>
              <div class="w-full h-64">
                <LineChart :title="''" :chart_id="'Time'" :data="chartDataSmoke" />
              </div>
              <h2 class="text-lg font-semibold mt-8 mb-4 text-gray-700">Black Smoke Status</h2>
              <div class="w-full h-64">
                <LineChart :title="''" :chart_id="'Status'" :data="chartDataStatus" />
              </div>
            </div>

            <!-- Average Times Pie Charts -->
            <div class="flex flex-col">
              <h2 class="text-lg font-semibold mb-4 text-gray-700">Average Times</h2>
              <div class="grid grid-cols-1 gap-6">
                <div class="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                  <div class="w-full h-32">
                    <!-- <PieChart :data="dailyRatioData" style="width: 100%; height: 100%;" /> -->
                    <PieChart :data="todayRatioData" style="width: 100%; height: 100%;" />
                  </div>
                  <p class="mt-2 text-gray-600 text-m font-semibold">Per Day</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                  <div class="w-full h-32">
                    <!-- <PieChart :data="monthlyRatioData" /> -->
                    <PieChart :data="todayRatioData" style="width: 100%; height: 100%;" />
                  </div>
                  <p class="mt-2 text-gray-600 text-m font-semibold">Per Month</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                  <div class="w-full h-32">
                    <!-- <PieChart :data="yearlyRatioData" /> -->
                    <PieChart :data="todayRatioData" style="width: 100%; height: 100%;" />
                  </div>
                  <p class="mt-2 text-gray-600 text-m font-semibold">Per Year</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div v-if="tabBar === 'Table'" class="bg-white rounded-lg shadow-md mt-6">
          <div class="flex items-center justify-between p-6 border-b">
            <h2 class="text-gray-700 font-semibold text-lg">Black Smoke Data</h2>
            <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Export Data
            </button>
          </div>
          <div>
            <Table :data="normalData" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue';
import { useSmokeStore } from '../stores/smoke';
import LineChart from '../components/LineChart.vue';
import Table from '../components/Table.vue';
import PieChart from '../components/PieChart.vue';

const smokeStore = useSmokeStore();

interface SmokeRatio {
  Black: number;
  White: number;
}

interface DataItem {
  date_time: string;
  TimeOfSmoke: number;
  Status: number;
}

interface ChartData {
  categories: string[];
  series: SeriesLineOptions[];
}

const tabBar = ref<'Graph' | 'Table'>('Graph');
const setTab = (tabName: 'Graph' | 'Table') => {
  tabBar.value = tabName;
};

watch(tabBar, (newVal, oldVal) => {
  console.log(`tabBar changed from ${oldVal} to ${newVal}`);
});

const startDate = ref(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);

const selectedSmoke = computed(() => smokeStore.selectedSmoke || {});
const blackCount = computed(() => smokeStore.blackCount || 0);
const whiteCount = computed(() => smokeStore.whiteCount || 0);
const normalData = computed(() => smokeStore.normalData || []);
const dailyData = computed<SmokeRatio>(() => smokeStore.dailyData || { Black: 0, White: 0 });
const monthlyData = computed<SmokeRatio>(() => smokeStore.monthlyData || { Black: 0, White: 0 });
const yearlyData = computed<SmokeRatio>(() => smokeStore.yearlyData || { Black: 0, White: 0 });

const chartDataSmoke = ref<ChartData>({
  categories: [],
  series: [],
});

const chartDataStatus = ref<ChartData>({
  categories: [],
  series: [],
});

const transformSmokeData = (data: DataItem[]) => {
  const categories = data.map(item => item.date_time);
  const seriesSmoke: SeriesLineOptions = {
    type: 'line',
    name: 'Time of Smokes (mins)',
    data: data.map(item => ({
      x: new Date(item.date_time).getTime(),
      y: item.TimeOfSmoke,
    })),
  };

  const seriesStatus: SeriesLineOptions = {
    type: 'line',
    name: 'Smoke Status',
    data: data.map(item => ({
      x: new Date(item.date_time).getTime(),
      y: item.Status,
    })),
  };

  return {
    smokeData: { categories, series: [seriesSmoke] },
    statusData: { categories, series: [seriesStatus] },
  };
};


const todayRatioData = computed(() => [
  { name: 'Black Smoke', y: blackCount.value },
  { name: 'White Smoke', y: whiteCount.value },
]);

const dailyRatioData = computed(() => [
  { name: 'Black Smoke', y: dailyData.value.Black },
  { name: 'White Smoke', y: dailyData.value.White },
]);

const monthlyRatioData = ref<{ name: string; y: number }[]>([]);
const yearlyRatioData = ref<{ name: string; y: number }[]>([]);

const fetchLatest = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    startDate.value = today;
    endDate.value = today;
    await smokeStore.filterSmoke(startDate.value, endDate.value);
  } catch (error) {
    console.error('Error in fetchLatest:', error);
  }
};

const realTime = async () => {
  try {
    await smokeStore.loadSmoke();
  } catch (error) {
    console.error('Error in fetchLatest:', error);
  }
};


const fetchFilterData = async () => {
  try {
    await smokeStore.filterSmoke(startDate.value, endDate.value);
    updateChartData();
    updateRatioData();
  } catch (error) {
    console.error('Error in fetchFilterData:', error);
  }
};

const updateChartData = () => {
  if (normalData.value && normalData.value.length > 0) {
    const { smokeData, statusData } = transformSmokeData(normalData.value);
    chartDataSmoke.value = smokeData;
    chartDataStatus.value = statusData;
    console.log('Smoke Data:', chartDataSmoke.value);
    console.log('Status Data:', chartDataStatus.value);
    console.log('Normal Data:', normalData);
  }
};

const updateRatioData = () => {
  if (normalData.value && normalData.value.length > 0) {
    console.log('Updating Ratio Data...');
    console.log('Daily Ratio Data Input:', dailyData.value);
    dailyRatioData.value = calculateRatioData(dailyData.value);
    monthlyRatioData.value = calculateRatioData(monthlyData.value);
    yearlyRatioData.value = calculateRatioData(yearlyData.value);
    console.log('Daily Ratio Data:', dailyRatioData.value);
    console.log('Monthly Ratio Data:', monthlyRatioData.value);
    console.log('Yearly Ratio Data:', yearlyRatioData.value);
  }
};


const calculateRatioData = (data: SmokeRatio) => [
  { name: 'Black Smoke', y: data.Black },
  { name: 'White Smoke', y: data.White },
];

const checkStatus = () => {
  const latest = selectedSmoke.value;
  if (!latest) return { smokeStatus: 'bg-red-500', status: 'bg-red-500' };
  const smokeStatus = latest.Status === 1 ? 'bg-red-500' : 'bg-green-500';
  const statusClass = latest.Status === 1 ? 'bg-red-500 text-white' : 'bg-green-500 text-white';
  return { smokeStatus, status: statusClass };
};

const status = computed(() => checkStatus());

let intervalId: ReturnType<typeof setInterval>;

onMounted(() => {
  fetchLatest();
  fetchFilterData();
  realTime();
  intervalId = setInterval(async () => {
    await realTime();
  }, 1000);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
