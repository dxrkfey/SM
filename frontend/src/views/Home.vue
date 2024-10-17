<template>
  <div class="h-full flex flex-col p-4 relative">
    <header class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">Dashboard</h1>
    </header>

    <!-- Main Content -->
    <div class="flex-grow grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-4">
      <!-- Left Section -->
      <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        <!-- Image Section -->
        <div class="rounded-lg shadow-md overflow-hidden">
          <img :src="selectedSmoke?.imageUrl" alt="Smoke Image" class="object-cover w-full h-full" />
        </div>

        <!-- Status and Duration -->
        <div class="grid grid-rows-2 gap-4">
          <!-- Status Section -->
          <div :class="['rounded-lg flex items-center justify-center p-4 shadow-md', status.status]">
            <h2 class="text-2xl font-bold tracking-wide">
              {{ selectedSmoke?.Status === 1 ? 'BLACK SMOKE' : 'WHITE SMOKE' }}
            </h2>
          </div>

          <!-- Duration Section -->
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

      <!-- Right Section -->
      <div class="grid grid-rows-2 gap-4">
        <!-- Count Section -->
        <div class="bg-white rounded-lg p-6 shadow-md flex flex-col items-center">
          <h2 class="text-gray-700 font-semibold text-xl mb-5">COUNT</h2>
          <div class="flex flex-col items-center">
            <p class="text-2xl font-bold text-gray-800 mt-5">{{ blackCount }}</p>
            <span class="text-xl font-bold text-gray-500 mt-7">times</span>
          </div>
        </div>

        <!-- Today Ratio Section -->
        <div class="bg-white rounded-lg p-6 shadow-md flex flex-col items-center max-w-full max-h-[256px]">
          <h2 class="text-gray-700 font-medium text-xl mb-4">Today Ratio</h2>
          <div class="w-full h-full flex items-center justify-center">
            <CChart :dataSource="todayRatioData" />
          </div>
        </div>
      </div>
    </div>

    <!-- Graph and Table Section -->
    <div class="py-6">
      <!-- Tab Bar -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6">
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
            <input name="start" type="datetime-local" class="bg-white border border-gray-300 text-sm rounded-md w-41 p-2"
              v-model="startDate" />
          </div>
          <span class="text-gray-500 text-sm">to</span>
          <div class="relative">
            <input name="end" type="datetime-local" class="bg-white border border-gray-300 text-sm rounded-md w-41 p-2"
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
                  <div class="w-full h-40">
                    <CChart :dataSource="dailyRatioData" />
                  </div>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                  <div class="w-full h-40">
                    <CChart :dataSource="monthlyRatioData" />
                  </div>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                  <div class="w-full h-40">
                    <CChart :dataSource="yearlyRatioData" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div v-if="tabBar === 'Table'" class="bg-white rounded-lg shadow-md mt-6">
          <div class="flex items-center justify-between p-6 border-b">
            <h2 class="text-gray-700 font-semibold text-lg">Black Smoke Data</h2>
            <button @click="exportToCSV"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Export Data
            </button>
          </div>
          <div>
            <Table v-if="normalData.length > 0" :data="normalData" />
            <p v-else class="text-center text-gray-500 py-4">No Data</p>
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
import CChart from '../components/donut.vue'; 
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend Day.js with UTC and Timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Define the Bangkok timezone
const BANGKOK_TZ = 'Asia/Bangkok';

// Interface definitions
interface SeriesLineOptions {
  type: 'line';
  name: string;
  data: { x: number; y: number }[];
}

interface RatioData {
  data: { name: string; y: number }[];
  unit: string;
  title: string;
  titleAlign: string;
  titleSize: string;
  chartSize: string;
  credits: boolean;
  spacingTop: number;
  spacingBottom: number;
  marginTop: number;
}

interface SmokeRatio {
  Black: string; // Changed to string to match backend data type
  White: string;
}

interface DataItem {
  No: number;
  date_time: string;
  Status: number;
  TimeOfSmoke: number;
}

interface ChartData {
  categories: string[];
  series: SeriesLineOptions[];
}

// Initialize smoke store
const smokeStore = useSmokeStore();

const tabBar = ref<'Graph' | 'Table'>('Graph');
const setTab = (tabName: 'Graph' | 'Table') => {
  tabBar.value = tabName;
};

// Initialize startDate and endDate with date-time strings in Bangkok timezone in 24-hour format
const startDate = ref<string>(
  dayjs().tz(BANGKOK_TZ).subtract(24, 'hour').format('YYYY-MM-DDTHH:mm')
);
const endDate = ref<string>(
  dayjs().tz(BANGKOK_TZ).format('YYYY-MM-DDTHH:mm')
);

const selectedSmoke = computed(() => smokeStore.selectedSmoke || {});
const blackCount = computed(() => smokeStore.blackCount || 0);
const normalData = computed(() => smokeStore.normalData || []);

// Access the first element of the arrays and handle parsing
const dailyData = computed<SmokeRatio>(() => smokeStore.dailyData[0] || { Black: '0', White: '0' });
const monthlyData = computed<SmokeRatio>(() => smokeStore.monthlyData[0] || { Black: '0', White: '0' });
const yearlyData = computed<SmokeRatio>(() => smokeStore.yearlyData[0] || { Black: '0', White: '0' });

const chartDataSmoke = ref<ChartData>({ categories: [], series: [] });
const chartDataStatus = ref<ChartData>({ categories: [], series: [] });

const todayRatioData = ref<RatioData>({
  data: [
    { name: 'Black Smoke', y: 0 },
    { name: 'White Smoke', y: 0 }
  ],
  unit: 'Ratio',
  title: '',
  titleAlign: 'center',
  titleSize: '12px',
  chartSize: '80',
  credits: false,
  spacingTop: 0,
  spacingBottom: 0,
  marginTop: 0
});

const dailyRatioData = ref<RatioData>({
  data: [
    { name: 'Black Smoke', y: 0 },
    { name: 'White Smoke', y: 0 }
  ],
  unit: 'Ratio',
  title: 'Daily Ratio',
  titleAlign: 'center',
  titleSize: '12px',
  chartSize: '80',
  credits: false,
  spacingTop: 0,
  spacingBottom: 0,
  marginTop: 20
});

const monthlyRatioData = ref<RatioData>({
  data: [
    { name: 'Black Smoke', y: 0 },
    { name: 'White Smoke', y: 0 }
  ],
  unit: 'Ratio',
  title: 'Monthly Ratio',
  titleAlign: 'center',
  titleSize: '12px',
  chartSize: '80',
  credits: false,
  spacingTop: 0,
  spacingBottom: 0,
  marginTop: 20
});

const yearlyRatioData = ref<RatioData>({
  data: [
    { name: 'Black Smoke', y: 0 },
    { name: 'White Smoke', y: 0 }
  ],
  unit: 'Ratio',
  title: 'Yearly Ratio',
  titleAlign: 'center',
  titleSize: '12px',
  chartSize: '80',
  credits: false,
  spacingTop: 0,
  spacingBottom: 0,
  marginTop: 20
});


const transformSmokeData = (data: DataItem[]) => {
  const categories = data.map(item => {
    return dayjs(item.date_time).tz(BANGKOK_TZ).format('DD MMM HH:mm');
  });

  const seriesSmoke: SeriesLineOptions = {
    type: 'line',
    name: 'Time of Smokes (mins)',
    data: data.map(item => ({
      x: dayjs(item.date_time).tz(BANGKOK_TZ).valueOf(),
      y: item.TimeOfSmoke,
    })),
  };

  const seriesStatus: SeriesLineOptions = {
    type: 'line',
    name: 'Smoke Status',
    data: data.map(item => ({
      x: dayjs(item.date_time).tz(BANGKOK_TZ).valueOf(),
      y: item.Status,
    })),
  };

  return {
    smokeData: { categories, series: [seriesSmoke] },
    statusData: { categories, series: [seriesStatus] },
  };
};

const updateChartData = () => {
  if (normalData.value && normalData.value.length > 0) {
    const { smokeData, statusData } = transformSmokeData(normalData.value);
    chartDataSmoke.value = smokeData;
    chartDataStatus.value = statusData;
  } else {
    chartDataSmoke.value = { categories: ['No Data'], series: [{ type: 'line', name: 'No Data', data: [[0, null]] }] };
    chartDataStatus.value = { categories: ['No Data'], series: [{ type: 'line', name: 'No Data', data: [[0, null]] }] };
  }
};


const updateRatioData = () => {
  dailyRatioData.value = {
    data: [
      { name: 'Black Smoke', y: parseInt(dailyData.value.Black, 10) || 0 },
      { name: 'White Smoke', y: parseInt(dailyData.value.White, 10) || 0 }
    ],
    unit: 'Ratio',
    title: 'Daily Ratio',
    titleAlign: 'center',
    titleSize: '12px',
    chartSize: '60',
    credits: false,
    spacingTop: 0,
    spacingBottom: 0,
    marginTop: 20
  };


  monthlyRatioData.value = {
    data: [
      { name: 'Black Smoke', y: parseInt(monthlyData.value.Black, 10) || 0 },
      { name: 'White Smoke', y: parseInt(monthlyData.value.White, 10) || 0 }
    ],
    unit: 'Ratio',
    title: 'Monthly Ratio',
    titleAlign: 'center',
    titleSize: '12px',
    chartSize: '60',
    credits: false,
    spacingTop: 0,
    spacingBottom: 0,
    marginTop: 20
  };


  yearlyRatioData.value = {
    data: [
      { name: 'Black Smoke', y: parseInt(yearlyData.value.Black, 10) || 0 },
      { name: 'White Smoke', y: parseInt(yearlyData.value.White, 10) || 0 }
    ],
    unit: 'Ratio',
    title: 'Yearly Ratio',
    titleAlign: 'center',
    titleSize: '12px',
    chartSize: '60',
    credits: false,
    spacingTop: 0,
    spacingBottom: 0,
    marginTop: 20
  };
};


const fetchLatest = async () => {
  try {
    const now = dayjs().tz(BANGKOK_TZ);
    const yesterday = now.subtract(24, 'hour');

    startDate.value = yesterday.format('YYYY-MM-DDTHH:mm');
    endDate.value = now.format('YYYY-MM-DDTHH:mm');

   
    const startDateUTC = dayjs(startDate.value).tz(BANGKOK_TZ).utc().toISOString();
    const endDateUTC = dayjs(endDate.value).tz(BANGKOK_TZ).utc().toISOString();
    await smokeStore.filterSmoke(startDateUTC, endDateUTC);
    updateChartData();
    updateRatioData();
  } catch (error) {
    console.error('Error in fetchLatest:', error);
    alert('Failed to fetch latest data. Please try again later.');
  }
};

const fetchFilterData = async () => {
  try {
    const start = dayjs(startDate.value).tz(BANGKOK_TZ);
    const end = dayjs(endDate.value).tz(BANGKOK_TZ);

    if (start.isAfter(end)) {
      alert('Start date-time must be before End date-time.');
      return;
    }
    chartDataSmoke.value = { categories: [], series: [{ type: 'line', name: '', data: [] }] };
    chartDataStatus.value = { categories: [], series: [{ type: 'line', name: '', data: [] }] };
    const startDateUTC = start.utc().toISOString();
    const endDateUTC = end.utc().toISOString();
    await smokeStore.filterSmoke(startDateUTC, endDateUTC);
    updateChartData();
    updateRatioData();
  } catch (error) {
    console.error('Error in fetchFilterData:', error);
    alert('Failed to fetch filtered data. Please try again later.');
  }
};

const checkStatus = () => {
  const latest = selectedSmoke.value;
  if (!latest) return { smokeStatus: 'bg-red-500', status: 'bg-red-500' };
  const smokeStatus = latest.Status === 1 ? 'bg-red-500' : 'bg-green-500';
  const statusClass = latest.Status === 1 ? 'bg-red-500 text-white' : 'bg-green-500 text-white';
  return { smokeStatus, status: statusClass };
};

const fetchData = async () => {
  await smokeStore.loadSmoke();
  todayRatioData.value = {
    data: [
      { name: 'Black Smoke', y: parseInt(selectedSmoke.value.Black, 10) || 0 },
      { name: 'White Smoke', y: parseInt(selectedSmoke.value.White, 10) || 0 }
    ],
    unit: 'Ratio',
    title: 'Daily Ratio',
    titleAlign: 'center',
    titleSize: '12px',
    chartSize: '60',
    credits: false,
    spacingTop: 0,
    spacingBottom: 0,
    marginTop: 20
  };
};


const status = computed(() => checkStatus());

const formatDate = (dateTime: string) => {
  return dayjs(dateTime).tz(BANGKOK_TZ).format('DD MMM');
};


const formatTime = (dateTime: string) => {
  return dayjs(dateTime).tz(BANGKOK_TZ).format('HH:mm:ss');
};

const convertToCSV = (data: DataItem[]): string => {
  if (!data.length) {
    return '';
  }

  const headers = ['No', 'Date', 'Time', 'Status', 'TimeOfSmoke'];
  const csvRows = [
    headers.map(header => `"${header}"`).join(','), 
    ...data.map(row => 
      [
        `"${row.No}"`,
        `"${formatDate(row.date_time)}"`,
        `"${formatTime(row.date_time)}"`,
        `"${row.Status === 1 ? 'Black' : 'White'}"`,
        `"${row.TimeOfSmoke} mins"`
      ].join(',')
    )
  ];

  return csvRows.join('\n');
};

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) { 
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const exportToCSV = () => {
  const csv = convertToCSV(normalData.value);
  if (!csv) {
    alert('No data available to export.');
    return;
  }
  downloadCSV(csv, 'black_smoke_data.csv');
};


let intervalId: ReturnType<typeof setInterval>;

onMounted(() => {
  fetchLatest();
  fetchFilterData();
  fetchData();
  intervalId = setInterval(async () => {
    await fetchData();
  }, 1000);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});

watch(normalData, () => {
  updateChartData();
  updateRatioData();
});

watch(dailyData, () => {
  updateRatioData();
});

watch(monthlyData, () => {
  updateRatioData();
});

watch(yearlyData, () => {
  updateRatioData();
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  overflow-x: hidden; 
  box-sizing: border-box;
}
</style>
