<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-3 bg-tropical">
    <div class="animate-fade-in w-11/12 p-2 sm:p-5 rounded shadow-2xl shadow-emerald-600 bg-white">
      <fieldset class="border-2 rounded-xl border-emerald-500 p-2 sm:p-4">
        <legend class="text-center text-2xl px-0.5">Cambia Password</legend>
        <label for="old_password" class="block text-sm font-medium text-gray-700">Vecchia Password</label>
        <input type="password" v-model="old_password" id="old_password" class="w-full px-3 py-2 mb-3 border rounded"
               placeholder="Old Password"/>
        <label for="new_password" class="block text-sm font-medium text-gray-700">Nuova Password</label>
        <input type="password" v-model="new_password" id="new_password" class="w-full px-3 py-2 mb-3 border rounded"
               placeholder="New Password"/>
        <label for="new_password_r" class="block text-sm font-medium text-gray-700">Ripeti Nuova Password</label>
        <input type="password" v-model="new_password_r" id="new_password_r" class="w-full px-3 py-2 mb-3 border rounded"
               placeholder="Repeat New Password"/>
        <button @click="changePassword" class="w-full px-3 py-2 text-white bg-emerald-500 rounded">Cambia Password</button>
        <p v-if="errorMessage" class="mt-2 text-red-500">{{ errorMessage }}</p>
      </fieldset>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useAuthStore} from '@/stores/authStore';
import authService from '@/services/authService';

export default defineComponent({
  setup() {
    const old_password = ref('');
    const new_password = ref('');
    const new_password_r = ref('');
    const errorMessage = ref('');
    const authStore = useAuthStore();
    //TODO: password validation?
    const changePassword = async () => {
      try {
        if (new_password.value !== new_password_r.value) {
          throw "Le password non corrispondono";
        }
        else if (old_password.value.trim() == "" || new_password.value.trim() == "" || new_password_r.value.trim() == "") {
          throw "I valori dei campi non possono essere vuoti!";
        }
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
