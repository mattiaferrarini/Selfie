<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow p-1 sm:p-2 fixed top-0 right-0 left-0 shadow-emerald-600" v-if="isAuthenticated">
      <div class="container mx-auto flex justify-between text-gray-700">
        <div class="flex items-center">
          <router-link to="/"
                       class="font-bold mr-2 sm:mr-3 sm:text-xl sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl"
                       active-class="text-emerald-700 sm:border-teal-500">
            <div class="flex items-center">
              <div class="hidden sm:flex items-center">
                <img src="@/assets/selfie.jpeg" alt="bradipo che si fa un selfie"
                     class="min-w-8 h-8 w-8 rounded-full inline-block"/>
                Selfie
              </div>
              <div class="block sm:hidden h-7 w-7">
                <v-icon name="co-home" class="h-full w-full"/>
              </div>
            </div>
          </router-link>
          <router-link to="/about"
                       class="font-semibold mr-2 sm:mr-3 sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl"
                       active-class="text-emerald-700 sm:border-teal-500">
            <span class="hidden sm:block">Calendario</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon name="bi-calendar3" class="h-full w-full"/>
            </div>
          </router-link>
          <router-link to="/about"
                       class="font-semibold mr-2 sm:mr-3 sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl"
                       active-class="text-emerald-700 sm:border-teal-500">
            <span class="hidden sm:block">Note</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon name="md-stickynote2-outlined" class="h-full w-full"/>
            </div>
          </router-link>
          <router-link to="/pomodoro"
                       class="font-semibold mr-2 sm:mr-3 sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl"
                       active-class="text-emerald-700 sm:border-teal-500">
            <span class="hidden sm:block">Pomodoro</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon name="md-timer-sharp" class="h-full w-full"/>
            </div>
          </router-link>
          <a href="/progetti.html" class="font-semibold sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl">
            <span class="hidden sm:block">Progetti</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon name="bi-calendar2-range" class="h-full w-full"/>
            </div>
          </a>
        </div>
        <div class="flex items-center">
          <div v-click-outside="closeTooltip">
            <button @click="toggleTooltip"
                    :class="['font-semibold sm:p-1 mr-2 sm:mr-3 border-2 border-teal-900 hover:border-teal-500 hover:text-teal-500 rounded-xl',
                     showTooltip ? ' text-teal-100 bg-teal-700': ' text-teal-900']">
              <span class="h-7 w-7">
                <v-icon name="gi-time-trap" class="h-full w-full"/>
              </span>
            </button>
            <div v-if="showTooltip"
                 class="absolute right-1 sm:right-10 md:right-20 top-12 sm:top-16 bg-white border-2 border-emerald-900 p-4 rounded-lg shadow shadow-emerald-800 z-10">
              <input type="date" v-model="selectedDate" @change="setCurrentDate"
                     class="p-2 border border-gray-300 rounded-md">
              <button @click="resetDate"
                      class="ml-2 bg-emerald-500 border border-emerald-900 text-white shadow p-2 rounded-md">Reset
              </button>
            </div>
          </div>
          <router-link to="/change-password"
                       class="font-semibold mr-2 sm:mr-3 sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl"
                       active-class="text-emerald-700 sm:border-teal-500">
            <span class="hidden sm:block">Profilo</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon name="ri-user-settings-line" class="h-full w-full"/>
            </div>
          </router-link>
          <button @click="logout" class="font-semibold sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl">
            <span class="hidden sm:block">Logout</span>
            <span class="block sm:hidden h-7 w-7">
              <v-icon name="ri-logout-circle-r-line" class="h-full w-full"/>
            </span>
          </button>
        </div>
      </div>
    </nav>
    <router-view class="pt-10 sm:pt-16"/>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useAuthStore} from '@/stores/authStore';
import {storeToRefs} from 'pinia'
import router from "@/router";
import {useDateStore} from "@/stores/dateStore";

export default defineComponent({
  setup() {
    const authStore = useAuthStore();
    const isAuthenticated = storeToRefs(authStore).isAuthenticated;
    const dateStore = useDateStore();
    const showTooltip = ref(false);
    const selectedDate = ref('');

    const logout = () => {
      authStore.clearAuthData();
      router.push({name: "login"})
      // Optionally, add any additional logout logic here
    };

    const toggleTooltip = () => {
      selectedDate.value = dateStore.getCurrentDate().toISOString().split('T')[0];
      showTooltip.value = !showTooltip.value;
    };

    const closeTooltip = () => {
      showTooltip.value = false;
    };

    const setCurrentDate = () => {
      dateStore.setCurrentDate(new Date(selectedDate.value));
    };

    const resetDate = () => {
      dateStore.setCurrentDate(new Date());
      selectedDate.value = (new Date()).toISOString().split('T')[0];
    };

    return {
      isAuthenticated,
      logout,
      showTooltip,
      toggleTooltip,
      selectedDate,
      setCurrentDate,
      resetDate,
      closeTooltip,
    };
  },
});
</script>

<style>
/* You can still add custom styles here if needed */
</style>
