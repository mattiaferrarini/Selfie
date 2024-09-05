<script setup lang="ts">
import {ref, onMounted} from "vue";
import noteService from "@/services/noteService";
import router from "@/router";
import {marked} from "marked";
import {useDateStore} from "@/stores/dateStore";

const dateStore = useDateStore();

const notes = ref();

type ordertype = "alphabetical" | "date" | "length";
const order = ref<ordertype>("date");

const changeOrder = () => {
  if (order.value === "alphabetical") {
    order.value = "date";
  } else if (order.value === "date") {
    order.value = "length";
  } else {
    order.value = "alphabetical";
  }
  OrderNote(order.value);
};

const OrderNote = (type: ordertype) => {
  if (type === "alphabetical") {
    notes.value.sort((a: any, b: any) => a.title.localeCompare(b.title));
  } else if (type === "date") {
    notes.value.sort((a: any, b: any) => -(new Date(b.lastmodify).getTime() - new Date(a.lastmodify).getTime()));
  } else {
    notes.value.sort((a: any, b: any) => b.contentLength - a.contentLength);
  }
}

const getnotes = async () => {
  notes.value = await noteService.getall();
};

const newnote = async () => {
  const date = new Date();
  const note = await noteService.create(
      "",
      `New note ${date.toLocaleString()}`,
      `${date.toISOString()}`,
      `${date.toISOString()}`,
      "Uncategorized"
  );

  const id = note._id;
  await router.push(`/note/${id}`);
};

onMounted(async () => {
  await getnotes();
  OrderNote(order.value);
});

</script>

<template>
  <div class="p-3">
    <div class="flex justify-center gap-2 pt-5 pb-5">
      <button class="bg-green-700 w-5/12 sm:w-auto text-white rounded-md p-2 sm:py-3 sm:px-5" @click="newnote()">New note</button>
      <button class="bg-yellow-400 w-7/12 sm:w-auto text-gray-800 rounded-md p-2 sm:py-3 sm:px-5" @click="changeOrder()">Order by {{ order }}</button>
    </div>

    <div class="flex flex-wrap justify-center m-auto gap-3 animate-fade-in">
      <div v-for="note in notes" :key="note._id" class="max-w-sm w-full h-fit max-h-[700px] overflow-auto rounded-lg bg-slate-50 border-2 border-gray-400 shadow-lg">
        <router-link :to="`/note/${note._id}`">
          <div class="p-4">
            <div class="flex flex-col justify-center pb-2 gap-y-2">
              <!-- note header information -->
              <div class="w-fit">
                <h1 class="font-bold text-3xl text-gray-800 break-word">{{ note.title }}</h1>
              </div>

              <span class="bg-blue-500 py-1 px-2 text-white break-words rounded w-fit">{{ note.category }}</span>

              <div class="flex flex-col bg-gray-200 p-2 rounded w-fit">
                <span class="break-words ">Created: {{ new Date(note.creation).toLocaleString() }}</span>
                <span class="break-words">Updated: {{ new Date(note.lastmodify).toLocaleString() }}</span>
              </div>
            </div>
            <hr class="bg-gray-500 rounded h-1 mt-2"/>
            <div class="text-gray-700 text-base break-words prose mt-4" v-html="marked(note.content)"></div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
