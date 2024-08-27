<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow p-1 sm:p-2 fixed top-0 right-0 left-0 shadow-emerald-600 z-20" v-if="isAuthenticated">
      <div class="container mx-auto flex justify-between text-gray-700">
        <div class="flex items-center">
          <router-link to="/"
                       class="relative font-bold mr-2 sm:mr-3 sm:text-xl sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl"
                       active-class="text-emerald-700 sm:border-teal-500">
            <div class="flex items-center relative">
              <div class="hidden sm:flex items-center">
                <img src="@/assets/selfie.jpeg" alt="bradipo che si fa un selfie"
                     class="min-w-8 h-8 w-8 rounded-full inline-block"/>
                Selfie
              </div>
              <div class="block sm:hidden h-7 w-7">
                <v-icon name="co-home" class="h-full w-full"/>
              </div>
            </div>
            <span class="absolute -top-1 -right-1 flex h-3 w-3" v-if="unread">
              <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex border border-emerald-50 rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
          </router-link>
          <router-link :to="{ name: 'calendar' }"
                       class="font-semibold mr-2 sm:mr-3 sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl"
                       active-class="text-emerald-700 sm:border-teal-500">
            <span class="hidden sm:block">Calendario</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon name="bi-calendar3" class="h-full w-full"/>
            </div>
          </router-link>
          <router-link :to="{ name: 'note' }"
                       class="font-semibold mr-2 sm:mr-3 sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl"
                       :class="{ 'text-emerald-700 sm:border-teal-500': $route.name === 'note' || $route.name === 'note-edit' }">
            <span class="hidden sm:block">Note</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon name="md-stickynote2-outlined" class="h-full w-full"/>
            </div>
          </router-link>
          <router-link :to="{ name: 'pomodoro' }"
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
                    :class="['font-semibold sm:p-1 mr-2 sm:mr-3 border-2 border-teal-900 hover:border-teal-500 hover:text-teal-500 rounded-xl ',
                     showTooltip ? 'text-teal-100 bg-teal-700': 'text-teal-900']">
              <span class="h-7 w-7 block">
                <v-icon name="gi-time-trap" class="h-full w-full"/>
              </span>
            </button>
            <div v-if="showTooltip"
                 class="absolute right-1 sm:right-10 md:right-20 top-12 sm:top-16 bg-white border-2 border-emerald-900 p-4 rounded-lg shadow shadow-emerald-800 z-10">
              <div class="flex">
                <div class="flex flex-col">
                  <input type="date" v-model="selectedDate" class="p-2 mb-2 border border-gray-300 rounded-md">
                  <input type="time" v-model="selectedTime" class=" text-center p-2 border border-gray-300 rounded-md">
                </div>
                <div class="flex flex-col ml-2 gap-y-2">
                  <button @click="setCurrentDate"
                          class=" bg-emerald-500 border text-white p-2 rounded-md">Set
                  </button>
                  <button @click="resetDate"
                          class=" bg-gray-500 border text-white p-2 rounded-md">Reset
                  </button>
                </div>
              </div>
              <p v-if="timeMachineMessage.length > 0" class="text-center mt-2">{{ timeMachineMessage }}</p>
            </div>
          </div>
          <router-link to="/admin" v-if="isAdmin"
                       class="font-semibold mr-2 sm:mr-3 sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl"
                       active-class="text-emerald-700 sm:border-teal-500">
            <span class="hidden sm:block">Admin</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon name="hi-view-grid-add" class="h-full w-full"/>
            </div>
          </router-link>
          <router-link to="/profile"
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
import {defineComponent, onMounted, ref} from 'vue';
import {useAuthStore} from '@/stores/authStore';
import {storeToRefs} from 'pinia'
import router from "@/router";
import {useDateStore} from "@/stores/dateStore";
import authService from "@/services/authService";
import {useWebSocketStore} from "@/stores/wsStore";
import timeMachineService from "@/services/timeMachineService";
import timeService from "@/services/timeService";

export default defineComponent({
  setup() {
    const authStore = useAuthStore();
    const isAuthenticated = storeToRefs(authStore).isAuthenticated;
    const isAdmin = storeToRefs(authStore).isAdmin;
    const wsStore = useWebSocketStore();
    const unread = storeToRefs(wsStore).unread;
    const dateStore = useDateStore();

    const showTooltip = ref(false);
    const selectedDate = ref('');
    const selectedTime = ref('');

    const timeMachineMessage = ref('');

    const logout = () => {
      authService.logout();
      authStore.clearAuthData();
      wsStore.disconnect();
      router.push({name: "login"})
    };

    if (isAuthenticated.value) {
      wsStore.connect();
    }

    const toggleTooltip = () => {
      initializeDate();
      showTooltip.value = !showTooltip.value;
    };

    const closeTooltip = () => {
      showTooltip.value = false;
    };

    const setCurrentDate = async () => {
      const oldDate = new Date();
      const date = new Date(selectedDate.value);
      date.setHours(Number(selectedTime.value.split(':')[0]), Number(selectedTime.value.split(':')[1]));

      await timeMachineService.setGlobalClock(date);
      dateStore.setCurrentDate(date);
      dateStore.setTimeDiff(date.getTime() - oldDate.getTime());

      displayTimeMachineMessage('Time machine set.');
    };

    const resetDate = () => {
      const oldDate = new Date();
      timeMachineService.restoreGlobalClock();
      dateStore.setCurrentDate(new Date());
      dateStore.setTimeDiff((new Date()).getTime() - oldDate.getTime());
      dateStore.setRealTimeDiff(0);

      displayTimeMachineMessage('Time machine reset.');
      initializeDate();
    };

    const initializeDate = () => {
      const now = new Date();
      const translatedDate = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
      selectedDate.value = translatedDate.toISOString().split('T')[0];
      selectedTime.value = timeService.formatTime(now);
    };

    const displayTimeMachineMessage = (message: string) => {
      timeMachineMessage.value = message;
      setTimeout(() => {
        timeMachineMessage.value = '';
      }, 2000);
    };

    // recover the time machine state
    onMounted(() => {
      const date = new Date(new Date().getTime() + dateStore.realTimeDiff);
      dateStore.realTimeDiff ? timeMachineService.setGlobalClock(date) : timeMachineService.restoreGlobalClock();
      dateStore.setCurrentDate(date);
    });

    return {
      isAuthenticated,
      isAdmin,
      unread,
      logout,
      showTooltip,
      toggleTooltip,
      selectedDate,
      selectedTime,
      setCurrentDate,
      resetDate,
      closeTooltip,
      timeMachineMessage
    };
  },
});
</script>

<style>
</style>