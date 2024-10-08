<script setup>
import { ref, reactive } from 'vue';

// State variables
const profilePic = ref(null); // No default image
const fileInput = ref(null);

// Reactive user object
const user = reactive({
  username: '',
  company: '',
  email: '',
  phone: '',
  address: '',
  notificationToken: '',
  profilePicData: '',
});

// Methods
const triggerFileInput = () => {
  fileInput.value.click();
};

const handleProfilePicChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      profilePic.value = reader.result;
      user.profilePicData = reader.result.split(',')[1];
    };
    reader.readAsDataURL(file);
  }
};

const saveUserInfo = () => {
  alert('User information saved.');
};
</script>
<template>
  <div>
    <div
      class="flex flex-col sm:mx-auto h-auto mt-2 justify-center w-full sm:w-3/4 md:w-1/2 p-4 sm:p-6 bg-white rounded-lg shadow-lg"
    >
      <div>
        <h2 class="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-700">
          My Account
        </h2>
        <hr class="mb-4 sm:mb-6" />
        <div
          class="flex flex-col sm:flex-row items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0 sm:space-x-8"
        >
          <div class="relative cursor-pointer" @click="triggerFileInput">
            <div
              class="w-[10rem] h-[10rem] rounded-full overflow-hidden flex items-center justify-center bg-gray-200"
            >
              <img
                v-if="profilePic"
                :src="profilePic"
                alt="Profile Picture"
                class="object-cover w-full h-full"
              />
              <div v-else class="text-gray-500 text-6xl">
                👤
              </div>
            </div>
            <div
              class="absolute inset-0 flex items-center justify-center text-white text-2xl bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-full"
            >
              📷
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleProfilePicChange"
              class="hidden"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div>
              <label class="block font-semibold mb-1 text-gray-600">Username</label>
              <input
                type="text"
                v-model="user.username"
                placeholder="Enter your username"
                maxlength="30"
                class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-gray-600">Company</label>
              <input
                type="text"
                v-model="user.company"
                placeholder="Enter your company"
                maxlength="30"
                class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-gray-600">Email</label>
              <input
                type="email"
                v-model="user.email"
                placeholder="Enter your email"
                maxlength="50"
                class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-gray-600">Phone</label>
              <input
                type="tel"
                v-model="user.phone"
                placeholder="Enter your phone number"
                maxlength="15"
                class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block font-semibold mb-1 text-gray-600">Address</label>
              <input
                type="text"
                v-model="user.address"
                placeholder="Enter your address"
                maxlength="100"
                class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div class="flex justify-end">
          <button
            @click="saveUserInfo"
            aria-label="Edit User Information"
            class="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300 shadow-md"
          >
            Save
          </button>
        </div>
      </div>
      <div class="mt-8">
        <h2 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">
          Notification
        </h2>
        <hr class="mb-4" />
        <div class="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <div class="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full">
            🔔
          </div>
          <div class="flex-grow">
            <label class="block font-semibold mb-1 text-gray-600">Notification Token</label>
            <input
              type="text"
              v-model="user.notificationToken"
              placeholder="Enter your notification token"
              class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div class="flex justify-end">
          <button
            @click="saveUserInfo"
            aria-label="Save Notification Token"
            class="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300 shadow-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
