<template>
  <div class="chat-view p-2 sm:p-4 flex flex-col h-full">
    <div class="flex">
      <input type="text" v-model="newMessage" placeholder="username"
             class="flex-grow p-2 border rounded-l-lg"/>
      <button @click="sendMessage" class="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-r-lg">
        Send
      </button>
    </div>
    <label for="selectedChat">Select chat</label>
    <select v-model="selectedUser" id="selectedChat" class="p-2 border">
      <option v-for="user in users" :key="user" :value="user">{{ user }}</option>
    </select>
    <h3 class="mt-2 text-lg font-semibold text-gray-800">Chat with {{ selectedUser }}</h3>
    <div class="messages flex-grow overflow-y-auto mb-4">
      <div v-for="(message, index) in messages" :key="index" class="message mb-2 flex">
        <div :class="message.senderUsername === username ? 'ml-auto bg-blue-200' : 'mr-auto bg-gray-200'"
             class="message-content p-2 rounded-lg max-w-xs">
          {{ message.text }}
        </div>
      </div>
    </div>
    <div class="flex">
      <input type="text" v-model="newMessage" placeholder="Type a message..."
             class="flex-grow p-2 border rounded-l-lg"/>
      <button @click="sendMessage" class="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-r-lg">
        Send
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useAuthStore} from "@/stores/authStore";

export default defineComponent({
  setup() {
    const username = useAuthStore().user.username
    const messages = ref([
      {text: 'Hello, how can I help you?', senderUsername: 'support123'},
      {text: 'I have a question about my order.', senderUsername: 'a'},
      {text: 'Hello, how can I help you?', senderUsername: 'support123'},
      {text: 'Hello, how can I help you?', senderUsername: 'support123'},
      {text: 'Hello, how can I help you?', senderUsername: 'support123'},
      {text: 'Hello, how can I help you?', senderUsername: 'support123'},
      {text: 'Hello, how can I help you?', senderUsername: 'support123'},
      {text: 'Hello, how can I help you?', senderUsername: 'support123'},
      {text: 'Hello, how can I help you?', senderUsername: 'support123'},
      {text: 'Hello, how can I help you?', senderUsername: 'support123'},
      {text: 'Hello, how can I help you?', senderUsername: 'support123'},
      {text: 'Hello, how can I help you?', senderUsername: 'support123'},
      {text: 'Hello, how can I help you?', senderUsername: 'support123'},
      {text: 'Hello, how can I help you?', senderUsername: 'support123'},
    ]);
    const users = ref(["1", "2", "3"]);
    const selectedUser =ref('1')
    const newMessage = ref('');

    const sendMessage = () => {
      if (newMessage.value.trim() !== '') {
        messages.value.push({text: newMessage.value, senderUsername: username});
        newMessage.value = ''; // Clear input after sending
      }
    };

    return {
      messages,
      users,
      username,
      selectedUser,
      newMessage,
      sendMessage,
    };
  },
});
</script>

<style scoped>
.messages {
  max-height: 300px; /* Adjust based on your modal size */
}
</style>