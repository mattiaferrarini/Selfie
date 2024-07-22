<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-3 bg-tropical">
    <div class="animate-fade-in w-11/12 p-2 sm:p-5 rounded shadow-2xl mt-2 shadow-emerald-600 bg-white">
      <div class="max-w-sm rounded overflow-hidden shadow-lg bg-emerald-50 mx-auto border">
        <div class="px-6 py-4">
          <div class="font-bold text-xl mb-2">@{{ user?.username }}</div>
          <p class="text-gray-700 text-base">
            Real Name: {{ user?.real_name }}
          </p>
          <p class="text-gray-700 text-base">
            Birthday: {{ user?.birthday.substring(0, 10) }}
          </p>
        </div>
      </div>
      <fieldset class="border-2 rounded-xl border-emerald-500 mt-2 p-2 sm:p-4">
        <legend class="text-center text-2xl px-0.5">Cambia Password</legend>
        <form @submit.stop="changePassword">
          <label for="old_password" class="block text-sm font-medium text-gray-700">Vecchia Password</label>
          <input type="password" v-model="old_password" id="old_password"
                 class="w-full px-3 py-2 mb-3 border rounded" required
                 placeholder="Old Password"/>
          <label for="new_password" class="block text-sm font-medium text-gray-700">Nuova Password</label>
          <input type="password" v-model="new_password" id="new_password"
                 class="w-full px-3 py-2 mb-3 border rounded" required
                 placeholder="New Password"/>
          <label for="new_password_r" class="block text-sm font-medium text-gray-700">Ripeti Nuova Password</label>
          <input type="password" v-model="new_password_r" id="new_password_r"
                 class="w-full px-3 py-2 mb-3 border rounded" required
                 placeholder="Repeat New Password"/>
          <input type="submit" value="Cambia Password"
                 class="w-full px-3 py-2 text-white bg-emerald-500 rounded"/>
        </form>
        <p v-if="passErrorMessage" class="mt-2 text-red-500">{{ passErrorMessage }}</p>
      </fieldset>
      <fieldset class="border-2 rounded-xl border-emerald-500 p-2 mt-4 sm:p-4">
        <legend class="text-center text-2xl px-0.5">Cambia Compleanno</legend>
        <form @submit.stop="changeBirthday">
          <label for="birthday" class="block text-sm font-medium text-gray-700">Compleanno</label>
          <input type="date" v-model="birthday" id="birthday" :max="(new Date()).toISOString().substring(0,10)"
                 min="1900-01-01" class="w-full px-3 py-2 mb-3 border rounded" required/>
          <input type="submit" value="Cambia Compleanno"
                 class="w-full px-3 py-2 text-white bg-emerald-500 rounded"/>
        </form>
        <p v-if="birthErrorMessage" class="mt-2 text-red-500">{{ birthErrorMessage }}</p>
      </fieldset>
      <fieldset class="border-2 rounded-xl border-emerald-500 p-2 mt-4 sm:p-4">
        <legend class="text-center text-2xl px-0.5">Cambia Nome</legend>
        <form @submit.stop="changeName">
          <label for="name" class="block text-sm font-medium text-gray-700">Nome Reale</label>
          <input type="text" v-model="real_name" id="name" placeholder="Fabio Rossi"
                 class="w-full px-3 py-2 mb-3 border rounded" required/>
          <input type="submit" value="Cambia Nome"
                 class="w-full px-3 py-2 text-white bg-emerald-500 rounded"/>
        </form>
        <p v-if="nameErrorMessage" class="mt-2 text-red-500">{{ nameErrorMessage }}</p>
      </fieldset>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import profileService from "@/services/profileService";
import {useAuthStore} from "@/stores/authStore";
import {storeToRefs} from "pinia";

export default defineComponent({
  setup() {
    const old_password = ref('');
    const new_password = ref('');
    const new_password_r = ref('');
    const authStore = useAuthStore();
    const user = storeToRefs(authStore).user;
    const birthday = ref();
    const real_name = ref();
    const passErrorMessage = ref('');
    const birthErrorMessage = ref('');
    const nameErrorMessage = ref('');

    //TODO: password validation?
    const changePassword = async () => {
      try {
        if (new_password.value !== new_password_r.value) {
          throw "Le password non corrispondono";
        } else if (old_password.value.trim() == "" || new_password.value.trim() == "" || new_password_r.value.trim() == "") {
          throw "I valori dei campi non possono essere vuoti!";
        }
        await profileService.changePassword(old_password.value, new_password.value);
        passErrorMessage.value = "Password cambiata con successo";
      } catch (error: any) {
        passErrorMessage.value = error;
      }
    };

    const changeBirthday = async () => {
      try {
        await profileService.changeBirthday(new Date(birthday.value));
        authStore.setBirthday(birthday.value);
        birthErrorMessage.value = "Compleanno cambiato con successo";
      } catch (error: any) {
        birthErrorMessage.value = error;
      }
    };

    const changeName = async () => {
      try {
        if (real_name.value.trim() == "") {
          throw "Il nome non può essere vuoto!";
        }
        await profileService.changeRealName(real_name.value);
        authStore.setRealName(real_name.value);
        nameErrorMessage.value = "Nome cambiato con successo";
      } catch (error: any) {
        nameErrorMessage.value = error;
      }
    };

    return {
      old_password,
      new_password,
      new_password_r,
      birthday,
      real_name,
      user,
      changePassword,
      changeBirthday,
      changeName,
      passErrorMessage,
      birthErrorMessage,
      nameErrorMessage,
    };
  },
});
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
