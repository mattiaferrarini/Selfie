<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-3 bg-tropical">
    <form @submit.stop="login"
          class="animate-fade-in w-full max-w-xs p-5 sm:p-10 pt-1 sm:pt-2 rounded shadow-2xl shadow-emerald-600 z-10 relative bg-[#fdfefd]">
      <img src="@/assets/selfie.jpeg" alt="bradipo che si fa un selfie"/>
      <input v-model="username" aria-label="Username"
             class="w-full px-3 py-2 mb-3 border rounded" placeholder="Username" required/>
      <input type="password" aria-label="Password" v-model="password"
             class="w-full px-3 py-2 mb-3 border rounded" placeholder="Password" required/>
      <input type="submit" value="Login" aria-label="Login"
             class="w-full px-3 py-2 text-white bg-emerald-500 mb-3 rounded cursor-pointer">
      <p v-if="errorMessage" class="mb-3 text-red-500">{{ errorMessage }}</p>
      <div class="text-center w-full">
        <router-link :to="{name: 'register'}" class="text-emerald-500">Not yet registered? Click here!</router-link>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useAuthStore} from '@/stores/authStore';
import authService from '@/services/authService';
import router from "@/router";

export default defineComponent({
  setup: function () {
    const username = ref('');
    const password = ref('');
    const errorMessage = ref(router.currentRoute.value.params.message);
    const authStore = useAuthStore();

    const login = async () => {
      try {
        if (username.value.trim() == "" || password.value.trim() == "") {
          throw "Username and password are required";
        }
        await authStore.clearAuthData();
        const data = await authService.login(username.value, password.value);
        await authStore.setUser(data.user);
        await router.push({name: 'home'})
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