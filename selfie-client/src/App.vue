<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow p-4">
      <div class="container mx-auto flex justify-between">
        <div>
          <router-link v-if="isAuthenticated" to="/" class="font-bold text-gray-700 mr-4" active-class="text-green-500">
            Home
          </router-link>
          <router-link v-if="isAuthenticated" to="/about" class="font-bold text-gray-700" active-class="text-green-500">
            About
          </router-link>
        </div>
        <div>
          <button v-if="isAuthenticated" @click="logout" class="font-bold text-red-500">Logout</button>
          <div v-else>
            <router-link to="/login" class="font-bold text-gray-700" active-class="text-green-500">Login</router-link>
            <router-link to="/register" class="font-bold text-gray-700 ml-2" active-class="text-green-500">Register
            </router-link>
          </div>
        </div>
      </div>
    </nav>
    <router-view/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useAuthStore} from '@/stores/authStore';

export default defineComponent({
  setup() {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;

    const logout = () => {
      authStore.clearAuthData();
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
