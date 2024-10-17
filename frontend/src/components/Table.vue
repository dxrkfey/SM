<!-- src/components/Table.vue -->
<template>
  <div class="max-h-64 overflow-y-auto rounded-lg shadow-md">
    <table class="w-full border-collapse text-center">
      <thead class="sticky top-0 bg-gray-200 z-10">
        <tr>
          <th class="border px-4 py-3">No</th>
          <th class="border px-4 py-3">Date</th>
          <th class="border px-4 py-3">Time</th>
          <th class="border px-4 py-3">Status</th>
          <th class="border px-4 py-3">Time of Smoke</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in data"
          :key="index"
          class="bg-white hover:bg-gray-100 transition-colors duration-200"
        >
          <td class="border px-4 py-2 text-sm text-gray-700">{{ item.No }}</td>
          <td class="border px-4 py-2 text-sm text-gray-700">{{ formatDate(item.date_time) }}</td>
          <td class="border px-4 py-2 text-sm text-gray-700">{{ formatTime(item.date_time) }}</td>
          <td class="border px-4 py-2 text-sm text-gray-700">{{ item.Status === 1 ? 'Black' : 'White' }}</td>
          <td class="border px-4 py-2 text-sm text-gray-700">{{ item.TimeOfSmoke }} mins</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface DataItem {
  No: number;
  date_time: string;
  Status: number;
  TimeOfSmoke: number;
}

const props = defineProps<{
  data: DataItem[];
}>();

const formatDate = (dateTime: string) => {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', timeZone: 'Asia/Bangkok' };
  const date = new Date(dateTime);
  return new Intl.DateTimeFormat('en-GB', options).format(date);
};

const formatTime = (dateTime: string) => {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' };
  const date = new Date(dateTime);
  return new Intl.DateTimeFormat('en-GB', options).format(date);
};
</script>

<style scoped>
.max-h-64 {
  max-height: 16rem; /* 256px */
}
</style>
