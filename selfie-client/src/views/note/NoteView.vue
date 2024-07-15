<script lang="ts">
import { ref, defineComponent } from "vue";
import noteService from "@/services/noteService";

export default defineComponent({
  setup() {

    const notes = ref();

    const createRandomNote = async () => {
      await noteService.create(
        createRandomString(50),
        createRandomString(10),
        "1-1-1",
        "1-1-1"
      );
    };

    const createRandomString = (length: number): string => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const getnotes = async () => {
      notes.value = await noteService.getall();
    };

    return {
      createRandomNote,
      getnotes,
      notes
    };
  },

  mounted() {
    this.getnotes();
  }
});
</script>

<template>
  <div>
    <h1>NOTE VIEW</h1>
    <button @click="createRandomNote()">create empty</button>
    <div class="flex flex-wrap justify-center m-4">
      <div v-for="note in notes" :key="note._id" class="max-w-sm rounded overflow-hidden shadow-lg">
        <router-link :to="'/note/'+note._id">
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2 break-words">{{ note.title }}</div>
            <p class="text-gray-700 text-base break-words">
              {{ note.content }}
            </p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
