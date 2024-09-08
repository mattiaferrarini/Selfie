<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-3 bg-tropical">
    <div class="animate-fade-in w-11/12 p-2 sm:p-5 rounded shadow-2xl mt-2 shadow-emerald-600 bg-white">
      <div class="max-w-sm rounded overflow-hidden shadow-lg bg-emerald-50 mx-auto border">
        <div class="px-6 py-4">
          <div class="font-bold text-xl mb-2">@{{ user?.username }}</div>
          <p class="text-gray-700 text-base">
            Real Name: {{ user?.realName }}
          </p>
          <p class="text-gray-700 text-base">
            Birthday: {{ user?.birthday.substring(0, 10) }}
          </p>
          <p class="text-gray-700 text-base">
            Notification Type: {{ user?.preferences.notificationType }}
          </p>
        </div>
      </div>
      <fieldset class="border-2 rounded-xl border-emerald-500 mt-2 p-2 sm:p-4">
        <legend class="text-center text-2xl px-0.5">Change Notification</legend>
        <form @submit.stop="changeNotificationType">
          <label class="block text-sm font-medium text-gray-700" for="notification_mode">Notification Type</label>
          <select id="notification_mode" v-model="notificationType" class="w-full px-3 py-2 mb-3 border rounded"
                  required type="password">
            <option value="email">Email</option>
            <option value="push">Web Push</option>
            <option value="both">Both</option>
          </select>
          <input class="w-full px-3 py-2 text-white bg-emerald-500 rounded cursor-pointer" type="submit"
                 value="Change Notification"/>
        </form>
        <p v-if="notificationErrorMessage" class="mt-2 text-red-500">{{ notificationErrorMessage }}</p>
      </fieldset>
      <fieldset class="border-2 rounded-xl border-emerald-500 mt-2 p-2 sm:p-4">
        <legend class="text-center text-2xl px-0.5">Change Password</legend>
        <form @submit.stop="changePassword">
          <label class="block text-sm font-medium text-gray-700" for="old_password">Old Password</label>
          <input id="old_password" v-model="old_password" class="w-full px-3 py-2 mb-3 border rounded"
                 placeholder="Old Password" required
                 type="password"/>
          <label class="block text-sm font-medium text-gray-700" for="new_password">New Password</label>
          <input id="new_password" v-model="new_password" class="w-full px-3 py-2 mb-3 border rounded"
                 placeholder="New Password" required
                 type="password"/>
          <label class="block text-sm font-medium text-gray-700" for="new_password_r">Repeat New Password</label>
          <input id="new_password_r" v-model="new_password_r" class="w-full px-3 py-2 mb-3 border rounded"
                 placeholder="Repeat New Password" required
                 type="password"/>
          <input class="w-full px-3 py-2 text-white bg-emerald-500 rounded cursor-pointer" type="submit"
                 value="Change Password"/>
        </form>
        <p v-if="passErrorMessage" class="mt-2 text-red-500">{{ passErrorMessage }}</p>
      </fieldset>
      <fieldset class="border-2 rounded-xl border-emerald-500 p-2 mt-4 sm:p-4">
        <legend class="text-center text-2xl px-0.5">Change Birthday</legend>
        <form @submit.stop="changeBirthday">
          <label class="block text-sm font-medium text-gray-700" for="birthday">Birthday</label>
          <input id="birthday" v-model="birthday" :max="(new Date()).toISOString().substring(0,10)" class="w-full px-3 py-2 mb-3 border rounded"
                 min="1900-01-01" required type="date"/>
          <input class="w-full px-3 py-2 text-white bg-emerald-500 rounded cursor-pointer" type="submit"
                 value="Change Birthday"/>
        </form>
        <p v-if="birthErrorMessage" class="mt-2 text-red-500">{{ birthErrorMessage }}</p>
      </fieldset>
      <fieldset class="border-2 rounded-xl border-emerald-500 p-2 mt-4 sm:p-4">
        <legend class="text-center text-2xl px-0.5">Change Name</legend>
        <form @submit.stop="changeName">
          <label class="block text-sm font-medium text-gray-700" for="name">Real Name</label>
          <input id="name" v-model="realName" class="w-full px-3 py-2 mb-3 border rounded" placeholder="Fabio Rossi"
                 required type="text"/>
          <input class="w-full px-3 py-2 text-white bg-emerald-500 rounded cursor-pointer" type="submit"
                 value="Change Name"/>
        </form>
        <p v-if="nameErrorMessage" class="mt-2 text-red-500">{{ nameErrorMessage }}</p>
      </fieldset>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue';
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
    const realName = ref();
    const notificationType = ref();
    const passErrorMessage = ref('');
    const birthErrorMessage = ref('');
    const nameErrorMessage = ref('');
    const notificationErrorMessage = ref('');

    const changeNotificationType = async () => {
      try {
        await profileService.updatePreferences({notificationType: notificationType.value});
        notificationErrorMessage.value = "Notifiche cambiate con successo";
      } catch (error: any) {
        notificationErrorMessage.value = error;
      }
    };

    const changePassword = async () => {
      try {
        if (new_password.value !== new_password_r.value) {
          throw "Passwords do not match!";
        } else if (old_password.value.trim() == "" || new_password.value.trim() == "" || new_password_r.value.trim() == "") {
          throw "Password cannot be empty!";
        }
        await profileService.changePassword(old_password.value, new_password.value);
        passErrorMessage.value = "Password successfully changed";
      } catch (error: any) {
        passErrorMessage.value = error;
      }
    };

    const changeBirthday = async () => {
      try {
        await profileService.changeBirthday(new Date(birthday.value));
        authStore.setBirthday(birthday.value);
        birthErrorMessage.value = "Birthday changed successfully";
      } catch (error: any) {
        birthErrorMessage.value = error;
      }
    };

    const changeName = async () => {
      try {
        if (realName.value.trim() == "") {
          throw "Name cannot be empty!";
        }
        await profileService.changeRealName(realName.value);
        authStore.setRealName(realName.value);
        nameErrorMessage.value = "Name changed successfully";
      } catch (error: any) {
        nameErrorMessage.value = error;
      }
    };

    onMounted(() => {
      birthday.value = user.value.birthday.substring(0, 10);
      realName.value = user.value.realName;
      notificationType.value = user.value.preferences.notificationType;
    })

    return {
      old_password,
      new_password,
      new_password_r,
      birthday,
      realName,
      notificationType,
      user,
      changeNotificationType,
      changePassword,
      changeBirthday,
      changeName,
      passErrorMessage,
      birthErrorMessage,
      nameErrorMessage,
      notificationErrorMessage,
    };
  },
});
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
