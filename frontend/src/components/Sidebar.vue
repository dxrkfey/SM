<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import QonnectFull from '../assets/QonnectFull.vue'
import ArrowCollapse from '../assets/ArrowCollapse.vue'
import HomeLine from '../assets/Home/HomeIconLine.vue'
import HomeFill from '../assets/Home/HomeIconFill.vue'
import SettingLine from '../assets/Setting/SettingIconLine.vue'
import SettingFill from '../assets/Setting/SettingIconFill.vue'

const open = ref(localStorage.getItem('sidebar_open') === 'false' ? false : true)

const menuItems = [
  {
    name: 'Home',
    path: '/',
    iconLine: HomeLine,
    iconFill: HomeFill,
  },
  {
    name: 'Setting',
    path: '/setting',
    iconLine: SettingLine,
    iconFill: SettingFill,
  },
]

const selectedMenuItem = ref('')

const router = useRouter()
const route = useRoute()

const navigate = (path) => {
  router.push(path)
}

watch(
  () => route.path,
  (newPath) => {
    const menuItem = menuItems.find(item => item.path === newPath)
    if (menuItem) {
      selectedMenuItem.value = menuItem.name
    } else {
      selectedMenuItem.value = ''
    }
  },
  { immediate: true }
)

const collapse = () => {
  open.value = !open.value
  localStorage.setItem('sidebar_open', open.value)
}

onMounted(() => {
  const menuItem = menuItems.find(item => item.path === route.path)
  if (menuItem) {
    selectedMenuItem.value = menuItem.name
  }
})
</script>

<template>
  <div
    :class="[open ? 'w-[200px]' : 'w-20', 'bg-[#242A2D]', 'h-screen', 'p-4', 'pt-8', 'duration-300', 'rounded-r-[15px]', 'transition-all']">
    <div class="inline-flex items-center">
      <QonnectFull class="mr-1" />
      <h1
        :class="['text-white origin-left font-medium text-2xl transition-all', { 'opacity-0 w-0': !open, 'opacity-100 w-auto': open }]">
        onnect
      </h1>
    </div>

    <div class="mt-8">
      <div v-for="item in menuItems" :key="item.name"
        :class="['flex items-center my-4 cursor-pointer', selectedMenuItem === item.name ? 'text-white' : 'text-gray-400', 'hover:text-white']"
        @click="navigate(item.path)">
        <div class="w-6 h-6 ml-2 flex-shrink-0">
          <component :is="selectedMenuItem === item.name ? item.iconFill : item.iconLine" />
        </div>

        <span class="ml-2 text-lg font-medium transition-all duration-300"
          :class="{ 'opacity-0 w-0': !open, 'opacity-100 w-auto': open }">
          {{ item.name }}
        </span>
        <div v-if="selectedMenuItem === item.name" class="absolute right-0 w-1.5 h-8 bg-white rounded-l-sm"></div>
      </div>
    </div>

    <div
      :class="['bg-white w-8 h-8 rounded-full mx-auto cursor-pointer absolute bottom-10 left-1/2 transform -translate-x-1/2', open ? '' : 'rotate-180', 'transition-transform duration-300']"
      @click="collapse">
      <ArrowCollapse />
    </div>
  </div>
</template>

<style scoped></style>
