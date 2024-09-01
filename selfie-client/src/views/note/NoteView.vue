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
      `new note ${date.toLocaleString()}`,
      `${date.toISOString()}`,
      `${date.toISOString()}`,
      "uncategorized"
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
    <div class="flex justify-center gap-5 pt-5 pb-5">
      <button class="bg-green-700 text-white rounded-lg p-3" @click="newnote()">new note</button>
      <button class="bg-yellow-400 rounded-xl p-3" @click="changeOrder()">order by {{ order }}</button>
    </div>

    <div class="flex flex-row flex-wrap justify-center m-auto gap-3">
      <div v-for="note in notes" :key="note._id" class="max-w-sm h-fit max-h-[700px] overflow-auto rounded border-2 border-black">
        <router-link :to="`/note/${note._id}`">
          <div class="p-4">
            <div class="flex flex-col justify-center pb-2 gap-y-2">
              <!-- note header information -->
              <div class="underline decoration-emerald-500 rounded w-fit">
                <h1 class="font-bold text-3xl break-word">{{ note.title }}</h1>
              </div>

              <span class="border-purple-500 border-2 p-0.5 break-words rounded w-fit">Category: {{ note.category }}</span>

              <div class="flex flex-col border-emerald-600 border-2 p-1 rounded w-fit">
                <span class="break-words ">Created: {{ new Date(note.creation).toLocaleString() }}</span>
                <span class="break-words">Updated: {{ new Date(note.lastmodify).toLocaleString() }}</span>
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
