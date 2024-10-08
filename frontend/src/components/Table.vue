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
        <tr v-for="(item, index) in data.data" :key="index"
          class="bg-white hover:bg-gray-100 transition-colors duration-200">
          <td class="border px-4 py-2 text-sm text-gray-700">{{ item.no }}</td>
          <td class="border px-4 py-2 text-sm text-gray-700">{{ formatDate(item.date_time) }}</td>
          <td class="border px-4 py-2 text-sm text-gray-700">{{ formatTime(item.date_time) }}</td>
          <td class="border px-4 py-2 text-sm text-gray-700">{{ item.blackTimeStatus }}</td>
          <td class="border px-4 py-2 text-sm text-gray-700">{{ item.blackTimeSmoke }} mins {{
            item.blackTimeSmokeSeconds }} secs</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  data: Object,
});

const formatDate = (dateTime) => {
  const options = { day: '2-digit', month: 'short', timeZone: 'UTC' };
  const date = new Date(dateTime);
  return new Intl.DateTimeFormat('en-GB', options).format(date);
};

const formatTime = (dateTime) => {
  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' };
  const date = new Date(dateTime);
  return new Intl.DateTimeFormat('en-GB', options).format(date);
};
</script>

<style scoped>
.table-auto {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

thead th {
  font-weight: 600;
  padding: 0.75rem 1rem;
}

tbody td {
  padding: 0.75rem 1rem;
  color: #4a5568;
}

.border {
  border: 1px solid #e2e8f0;
}

tbody tr:hover {
  background-color: #edf2f7;
}

.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.rounded-lg {
  border-radius: 8px;
}

.sticky {
  background-color: #f7fafc;
  /* Ensure sticky header has a background */
  z-index: 50;
}

.transition-colors {
  transition: background-color 0.3s ease;
}
</style>
