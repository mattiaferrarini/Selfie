<template>
  <div class="chat-view p-2 sm:p-4 flex flex-col h-full max-h-[80vh]">
    <div class="flex">
      <input type="text" v-model="newUser" placeholder="username" v-on:keyup.enter="addUser"
             class="flex-grow p-2 border rounded-l-lg"/>
      <button @click="addUser"
              class="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-r-lg">
        Add
      </button>
    </div>
    <label for="selectedChat">Select chat</label>
    <select v-model="selectedUser" id="selectedChat" class="p-2 border">
      <option v-for="user in users" :key="user" :value="user">{{ user }}</option>
    </select>
    <h3 class="mt-2 text-lg font-semibold text-gray-800">Chat with {{ selectedUser }}</h3>
    <div class="flex-grow overflow-y-auto mb-4 flex-col-reverse flex">
      <div v-for="(message, index) in messages.get(selectedUser)" :key="index" class="message mb-2 flex">
        <div :class="message.user === username ? 'ml-auto bg-blue-200' : 'mr-auto bg-gray-200'"
             class="message-content p-2 rounded-lg max-w-xs">
          {{ message.text }}
          <p class="text-xs">{{ (new Date(message.date)).toISOString().substring(0, 16).split('T').join(' ') }}</p>
        </div>
      </div>
    </div>
    <div class="flex">
      <textarea type="text" v-model="newMessage" v-on:keyup.enter="sendMessage" placeholder="Type a message..."
             class="flex-grow p-2 border rounded-l-lg"/>
      <button @click="sendMessage" class="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-r-lg">
        Send
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import {useAuthStore} from "@/stores/authStore";
import {useWebSocketStore} from "@/stores/wsStore";
import {storeToRefs} from "pinia";

export default defineComponent({
  setup() {
    const wsStore = useWebSocketStore();
    const messages = storeToRefs(wsStore).messages;
    const username = useAuthStore().user.username

    const users = computed(() => Array.from(messages.value.keys()));

    const selectedUser = ref();
    const newUser = ref();
    const newMessage = ref('');

    selectedUser.value = users.value[0];

    const addUser = () => {
      if (newUser.value.trim() !== '') {
        users.value.push(newUser.value);
        selectedUser.value = newUser.value;
        newUser.value = '';
      }
    }

    const sendMessage = () => {
      if (newMessage.value.trim() !== '') {
        wsStore.sendMessage(selectedUser.value, newMessage.value);
        newMessage.value = ''; // Clear input after sending
      }
    };

    return {
      messages,
      users,
      username,
      selectedUser,
      newUser,
      newMessage,
      sendMessage,
      addUser,
    };
  },
});
</script>

<style scoped>
</style>