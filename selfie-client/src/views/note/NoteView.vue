<script septup lang="ts">
import { ref, defineComponent } from "vue";
import noteService from "@/services/noteService";

export default defineComponent({
  setup() {
    const allnotes = ref();
    noteService.getall().then((resolve) => (allnotes.value = resolve));

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

    return {
      allnotes,
      createRandomNote,
    };
  },
});
</script>

<template>
  <div>
    <h1>NOTE VIEW</h1>
    <button @click="createRandomNote()">create empty</button>
    <div class="flex flex-wrap justify-center m-4">
      <div v-for="note in allnotes" :key="note.id" class="max-w-sm rounded overflow-hidden shadow-lg">
        <div class="px-6 py-4">
          <div class="font-bold text-xl mb-2 break-words">{{ note.title }}</div>
          <p class="text-gray-700 text-base break-words">
            {{ note.content }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
