<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-3 bg-tropical">
    <form
        @submit.stop="register"
        class="animate-fade-in w-full max-w-xs p-5 sm:p-10 pt-1 sm:pt-2 rounded shadow-2xl shadow-emerald-600 bg-[#fdfefd]">
      <img src="@/assets/selfie.jpeg" alt="bradipo che si fa un selfie"/>
      <input v-model="username" aria-label="username" class="w-full px-3 py-2 mb-3 border rounded"
             placeholder="Username" required/>
      <input v-model="realName" aria-label="real name" class="w-full px-3 py-2 mb-3 border rounded"
             placeholder="Real Name" required/>
      <input v-model="email" aria-label="email" type="email" class="w-full px-3 py-2 mb-3 border rounded"
             placeholder="Email" required/>
      <input type="password" aria-label="password" v-model="password" class="w-full px-3 py-2 mb-3 border rounded"
             placeholder="Password" required/>
      <label for="date" class="block text-sm font-medium text-gray-700">Birthday</label>
      <input v-model="birthday" aria-label="birthday" type="date" id="date" class="w-full px-3 py-2 mb-3 border rounded"
             :max="(new Date()).toISOString().substring(0,10)" min="1900-01-01" required/>
      <input type="submit" class="w-full px-3 py-2 mb-3 text-white bg-emerald-500 rounded cursor-pointer"
             value="Register"/>
      <p v-if="errorMessage" class="mb-3 text-red-500">{{ errorMessage }}</p>
      <div class="text-center w-full">
        <router-link to="/login" class="text-emerald-500">Already registered? Login</router-link>
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
  setup() {
    const username = ref('');
    const email = ref('');
    const realName = ref('');
    const birthday = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const authStore = useAuthStore();
    //TODO: password validation?
    const register = async () => {
      try {
        if (username.value.trim() == "" || password.value.trim() == "" || email.value.trim() == "" || realName.value.trim() == "" || birthday.value.trim() == "") {
          throw "All fields are required";
        } else if (!/^[a-zA-Z0-9_]*$/.test(username.value.trim()))
          throw "Username can only contain ascii letters, numbers and underscores";
        const data = await authService.register(username.value, realName.value, email.value, password.value, birthday.value);
        await authStore.setUser(data.user);
        router.push({name: 'home'})
      } catch (error: any) {
        errorMessage.value = error;
      }
    };

    return {
      username,
      password,
      email,
      realName,
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
