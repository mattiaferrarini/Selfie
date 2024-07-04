<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow p-2 fixed top-0 right-0 left-0 shadow-emerald-600" v-if="isAuthenticated">
      <div class="container mx-auto flex justify-between text-gray-700">
        <div class="flex items-center">
          <router-link to="/" class="font-bold mr-3 text-xl p-1 border-2 hover:border-emerald-500 rounded-xl" active-class="border-teal-500">
            <div class="flex items-center">
              <img src="@/assets/selfie.jpeg" alt="bradipo che si fa un selfie"
                   class="h-8 w-8 rounded-full inline-block"/>
              Selfie
            </div>
          </router-link>
          <router-link to="/about" class="font-semibold mr-3 p-1 border-2 hover:border-emerald-500 rounded-xl" active-class="border-teal-500">
            Calendario
          </router-link>
          <router-link to="/about" class="font-semibold mr-3 p-1 border-2 hover:border-emerald-500 rounded-xl" active-class="border-teal-500">
            Note
          </router-link>
          <router-link to="/about" class="font-semibold mr-3 p-1 border-2 hover:border-emerald-500 rounded-xl" active-class="border-teal-500">
            Pomodoro
          </router-link>
          <a href="/progetti.html" class="font-semibold p-1 border-2 hover:border-emerald-500 rounded-xl">
            Progetti
          </a>
        </div>
        <div class="flex items-center">
          <router-link to="/change-password" class="font-semibold mr-3 p-1 border-2 hover:border-emerald-500 rounded-xl" active-class="border-teal-500">
            Profilo
          </router-link>
          <button @click="logout" class="font-semibold p-1 border-2 hover:border-emerald-500 rounded-xl">Logout</button>
        </div>
      </div>
    </nav>
    <router-view/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useAuthStore} from '@/stores/authStore';
import {storeToRefs} from 'pinia'
import router from "@/router";

export default defineComponent({
  setup() {
    const authStore = useAuthStore();
    const isAuthenticated = storeToRefs(authStore).isAuthenticated;

    const logout = () => {
      authStore.clearAuthData();
      router.push({name: "login"})
      // Optionally, add any additional logout logic here
    };

    return {
      isAuthenticated,
      logout,
    };
  },
});
</script>

<style>
/* You can still add custom styles here if needed */
</style>
