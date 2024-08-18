<script setup lang="ts">
import {ref, onMounted} from "vue";
import noteService from "@/services/noteService";
import router from "@/router";
import {marked} from "marked";

const notes = ref();

const getnotes = async () => {
  notes.value = await noteService.getall();
};

const newnote = async () => {
  const note = await noteService.create(
      "",
      `new note ${new Date()}`,
      `${new Date()}`,
      `${new Date()}`,
      "uncategorized"
  );

  const id = note._id;
  await router.push(`/note/${id}`);
};

onMounted(async () => {
  await getnotes();
});

</script>

<template>
  <div class="p-3">
    <div class="flex justify-center">
      <button class="focus:outline-none text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700" @click="newnote()">new note</button>
    </div>

    <div class="flex flex-row flex-wrap justify-center m-auto gap-3">
      <div v-for="note in notes" :key="note._id" class="max-w-sm h-fit max-h-[700px] overflow-scroll rounded border-2 border-black">
        <router-link :to="`/note/${note._id}`">
          <div class="p-4">
            <div class="flex flex-col justify-center pb-2 gap-y-2">
              <!-- note header information -->
              <div class="bg-gray-400 rounded w-fit">
                <h1 class="font-bold text-3xl break-word">{{ note.title }}</h1>
              </div>

              <span class="bg-purple-500 break-words rounded w-fit">Category: {{ note.category }}</span>

              <div class="flex flex-col bg-blue-500 rounded w-fit">
                <span class="break-words ">Created: {{ note.creation }}</span>
                <span class="break-words">Updated: {{ note.lastmodify }}</span>
              </div>
            </div>
            <div class="bg-black rounded h-1"></div>
            <div class="text-gray-700 text-base break-words prose" v-html="marked(note.content)"></div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
