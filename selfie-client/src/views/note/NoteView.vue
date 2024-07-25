<script lang="ts">
import { ref, defineComponent } from "vue";
import noteService from "@/services/noteService";
import router from "@/router";

export default defineComponent({
  setup() {

    const notes = ref();

    const getnotes = async () => {
      notes.value = await noteService.getall();
    };

    const newnote = async () => {
      let note = await noteService.create("", `new note ${new Date()}`, `${new Date()}`, `${new Date()}`, "uncategorized");
      let id = note._id;
      await router.push(`/note/${id}`);
    };

    return {
      getnotes,
      newnote,
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
    <div class="flex justify-center">
      <button class="focus:outline-none text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700" @click="newnote()">new note</button>
    </div>

    <div class="flex flex-wrap justify-center max-w-screen-md m-auto">
      <div v-for="note in notes" :key="note._id" class="max-w-sm rounded overflow-hidden shadow-lg">
        <router-link :to="`/note/${note._id}`">
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2 break-words">{{ note.title }}</div>
            <p class="text-gray-700 text-base break-words">
              {{ note.content }}
            </p>
          </div>
          <div>
            <div class="px-6 py-4">
              <span>{{ note.category }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
