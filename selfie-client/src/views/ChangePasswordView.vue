<template>
  <div class="flex flex-col items-center justify-center min-h-screen py-2">
    <div class="w-full max-w-xs">
      <input type="password" v-model="old_password" class="w-full px-3 py-2 mb-3 border rounded" placeholder="Old Password" />
      <input type="password" v-model="new_password" class="w-full px-3 py-2 mb-3 border rounded" placeholder="New Password" />
      <input type="password" v-model="new_password_r" class="w-full px-3 py-2 mb-3 border rounded" placeholder="Repeat New Password" />
      <button @click="changePassword" class="w-full px-3 py-2 text-white bg-blue-500 rounded">Cambia Password</button>
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
    const old_password = ref('');
    const new_password = ref('');
    const new_password_r = ref('');
    const errorMessage = ref('');
    const authStore = useAuthStore();
    //TODO: add form validation
    const changePassword = async () => {
      try {
        await authService.changePassword(old_password.value, new_password.value);
        errorMessage.value = "Password cambiata con successo";
      } catch (error: any) {
        errorMessage.value = error;
      }
    };

    return {
      old_password,
      new_password,
      new_password_r,
      changePassword,
      errorMessage,
    };
  },
});
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
