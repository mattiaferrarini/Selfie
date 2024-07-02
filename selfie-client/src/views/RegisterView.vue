<template>
  <div class="flex flex-col items-center justify-center min-h-screen py-2">
    <div class="w-full max-w-xs">
      <input v-model="username" class="w-full px-3 py-2 mb-3 border rounded" placeholder="Username" />
      <input v-model="real_name" class="w-full px-3 py-2 mb-3 border rounded" placeholder="Real Name" />
      <input v-model="email" type="email" class="w-full px-3 py-2 mb-3 border rounded" placeholder="Email" />
      <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
      <input type="password" id="password" v-model="password" class="w-full px-3 py-2 mb-3 border rounded" placeholder="Password" />
      <label for="date" class="block text-sm font-medium text-gray-700">Birthday</label>
      <input v-model="birthday" type="date" id="date" class="w-full px-3 py-2 mb-3 border rounded" placeholder="12-03-2003" />
      <button @click="register" class="w-full px-3 py-2 text-white bg-blue-500 rounded">Register</button>
      <p v-if="errorMessage" class="mt-2 text-red-500">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import authService from '@/services/authService';

export default defineComponent({
  setup() {
    const username = ref('');
    const email = ref('');
    const real_name = ref('');
    const birthday = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const authStore = useAuthStore();

    const register = async () => {
      try {
        const data = await authService.register(username.value, real_name.value, email.value, password.value, birthday.value);
        authStore.setUser(data.user);
        // Redirect to a protected page or home
        // this.$router.push('/');
      } catch (error: any) {
        errorMessage.value = error.message;
      }
    };

    return {
      username,
      password,
      email,
      real_name,
      birthday,
      register,
      errorMessage,
    };
  },
});
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
