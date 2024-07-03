<template>
  <div class="flex flex-col items-center justify-center min-h-screen py-2">
    <div class="w-full max-w-xs bg-white p-10 pt-0 rounded">
      <img src="@/assets/selfie.jpeg" alt="bradipo che si fa un selfie" />
      <input v-model="username" class="w-full px-3 py-2 mb-3 border rounded" placeholder="Username" />
      <input type="password" v-model="password" class="w-full px-3 py-2 mb-3 border rounded" placeholder="Password" />
      <button @click="login" class="w-full px-3 py-2 text-white bg-blue-500 rounded">Login</button>
      <p v-if="errorMessage" class="mt-2 text-red-500">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import authService from '@/services/authService';
import router from "@/router";

export default defineComponent({
  setup() {
    const username = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const authStore = useAuthStore();
    //TODO: add form validation
    const login = async () => {
      try {
        const data = await authService.login(username.value, password.value);
        authStore.setUser(data.user);
        console.log(authStore.isAuthenticated);
        // Redirect to a protected page or home
        // this.$router.push('/');
        router.push({ name: 'home' })
      } catch (error: any) {
        errorMessage.value = error;
      }
    };

    return {
      username,
      password,
      login,
      errorMessage,
    };
  },
});
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
