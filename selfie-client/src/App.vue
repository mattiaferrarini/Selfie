<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <nav v-if="isAuthenticated" class="bg-white shadow p-1 sm:p-2 fixed top-0 right-0 left-0 shadow-emerald-600 z-20">
      <div class="container mx-auto flex justify-between text-gray-700">
        <div class="flex items-center">
          <router-link active-class="text-emerald-700 sm:border-teal-500"
            class="relative font-bold mr-2 sm:mr-3 sm:text-xl sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl"
            to="/">
            <div class="flex items-center relative">
              <div class="hidden sm:flex items-center">
                <img alt="bradipo che si fa un selfie" class="min-w-8 h-8 w-8 rounded-full inline-block"
                  src="@/assets/selfie.jpeg" />
                Selfie
              </div>
              <div class="block sm:hidden h-7 w-7">
                <v-icon class="h-full w-full" name="co-home" />
              </div>
            </div>
            <span v-if="unread" class="absolute -top-1 -right-1 flex h-3 w-3">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex border border-emerald-50 rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
          </router-link>
          <router-link :to="{ name: 'calendar' }" active-class="text-emerald-700 sm:border-teal-500"
            class="font-semibold mr-2 sm:mr-3 sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl">
            <span class="hidden sm:block">Calendar</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon class="h-full w-full" name="bi-calendar3" />
            </div>
          </router-link>
          <router-link
            :class="{ 'text-emerald-700 sm:border-teal-500': $route.name === 'note' || $route.name === 'note-edit' }"
            :to="{ name: 'note' }"
            class="font-semibold mr-2 sm:mr-3 sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl">
            <span class="hidden sm:block">Notes</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon class="h-full w-full" name="md-stickynote2-outlined" />
            </div>
          </router-link>
          <router-link :to="{ name: 'pomodoro' }" active-class="text-emerald-700 sm:border-teal-500"
            class="font-semibold mr-2 sm:mr-3 sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl">
            <span class="hidden sm:block">Pomodoro</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon class="h-full w-full" name="md-timer-sharp" />
            </div>
          </router-link>
          <a class="font-semibold sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl" href="/projects.html">
            <span class="hidden sm:block">Projects</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon class="h-full w-full" name="bi-calendar2-range" />
            </div>
          </a>
        </div>
        <div class="flex items-center">
          <div v-click-outside="closeTooltip">
            <button :class="['font-semibold sm:p-1 mr-2 sm:mr-3 border-2 border-teal-900 hover:border-teal-500 hover:text-teal-500 rounded-xl ',
              showTooltip ? 'text-teal-100 bg-teal-700' : 'text-teal-900']" @click="toggleTooltip">
              <span class="h-7 w-7 block">
                <v-icon class="h-full w-full" name="gi-time-trap" />
              </span>
            </button>
            <div v-if="showTooltip"
              class="absolute right-1 sm:right-10 md:right-20 top-12 sm:top-16 bg-white border-2 border-emerald-900 p-4 rounded-lg shadow shadow-emerald-800 z-10">
              <div class="flex">
                <div class="flex flex-col">
                  <input v-model="selectedDate" class="p-2 mb-2 border border-gray-300 rounded-md" type="date">
                  <input v-model="selectedTime" class=" text-center p-2 border border-gray-300 rounded-md" type="time">
                </div>
                <div class="flex flex-col ml-2 gap-y-2">
                  <button class=" bg-emerald-500 border text-white p-2 rounded-md" @click="setCurrentDate">Set
                  </button>
                  <button class=" bg-gray-500 border text-white p-2 rounded-md" @click="resetDate">Reset
                  </button>
                </div>
              </div>
              <p v-if="timeMachineMessage.length > 0" class="text-center mt-2" :class="{'text-red-500': isErrorMessage, 'text-gray-700': !isErrorMessage}">{{ timeMachineMessage }}</p>
            </div>
          </div>
          <router-link v-if="isAdmin" active-class="text-emerald-700 sm:border-teal-500"
            class="font-semibold mr-2 sm:mr-3 sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl"
            :to="{ name: 'admin' }">
            <span class="hidden sm:block">Admin</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon class="h-full w-full" name="hi-view-grid-add" />
            </div>
          </router-link>
          <router-link active-class="text-emerald-700 sm:border-teal-500"
            class="font-semibold mr-2 sm:mr-3 sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl"
            :to="{ name: 'profile' }">
            <span class="hidden sm:block">Profile</span>
            <div class="block sm:hidden h-7 w-7">
              <v-icon class="h-full w-full" name="ri-user-settings-line" />
            </div>
          </router-link>
          <button class="font-semibold sm:p-1 sm:border-2 hover:border-emerald-500 rounded-xl" @click="logout">
            <span class="hidden sm:block">Logout</span>
            <span class="block sm:hidden h-7 w-7">
              <v-icon class="h-full w-full" name="ri-logout-circle-r-line" />
            </span>
          </button>
        </div>
      </div>
    </nav>
    <router-view class="pt-10 sm:pt-16" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia'
import router from "@/router";
import { useDateStore } from "@/stores/dateStore";
import authService from "@/services/authService";
import { useWebSocketStore } from "@/stores/wsStore";
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
    const isErrorMessage = ref(false);

    const logout = () => {
      authService.logout();
      authStore.clearAuthData();
      wsStore.disconnect();
      router.push({ name: "login" })
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
      try {
        await timeMachineService.setGlobalClock(date).then(() => {
          dateStore.setCurrentDate(date);
          dateStore.setTimeDiff(date.getTime() - oldDate.getTime());
          displayTimeMachineMessage('Time machine set.', false);
        });
      } catch {
        displayTimeMachineMessage('Time machine set failed.', true);
      }
    };

    const resetDate = async () => {
      const oldDate = new Date();
      try {
        await timeMachineService.restoreGlobalClock().then(() => {
          dateStore.setCurrentDate(new Date());
          dateStore.setTimeDiff((new Date()).getTime() - oldDate.getTime());
          dateStore.setRealTimeDiff(0);

          displayTimeMachineMessage('Time machine reset.', false);
          initializeDate();
        });
      }
      catch {
        displayTimeMachineMessage('Time machine reset failed.', true);
      }
    };

    const initializeDate = () => {
      const now = new Date();
      const translatedDate = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
      selectedDate.value = translatedDate.toISOString().split('T')[0];
      selectedTime.value = timeService.formatTime(now);
    };

    const displayTimeMachineMessage = (message: string, isError: boolean) => {
      timeMachineMessage.value = message;
      isErrorMessage.value = isError;
      setTimeout(() => {
        timeMachineMessage.value = '';
        isErrorMessage.value = false;
      }, 2000);
    };

    // recover the time machine state
    onMounted(async () => {
      try{
        const date = await timeMachineService.getTimeOfServer();
        timeMachineService.setLocalGlobalClock(date);
        dateStore.setCurrentDate(date);
      }
      catch{
        // TODO: handle error
      }
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
      timeMachineMessage,
      isErrorMessage,
    };
  },
});
</script>

<style></style>