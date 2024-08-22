<script setup lang="ts">
import {defineProps, onMounted, toRefs} from 'vue';
import { ref } from 'vue';
import noteService from "@/services/noteService";

const props = defineProps< {
  date: Date,
  desc: boolean,
}>()

const { date } = toRefs(props)

let notes: any[] = []
const noteList = ref<any[]>([]);

const MAX_NOTES = 5;


const makeNoteList = (notes: any[]) => {
  // order for nearest modification date
  notes.sort((a, b) => (date.value.getTime() - new Date(a.lastmodify).getTime()) - (date.value.getTime() - new Date(b.lastmodify).getTime()));

  // limit to MAX_NOTES
  noteList.value =  notes.slice(0, MAX_NOTES);
}

onMounted(async () => {
  notes = await noteService.getall();
  makeNoteList(notes);
});

</script>

<template>
  <div class="p-4 bg-white rounded-lg shadow border">
    <h3 class="text-lg font-semibold text-gray-800">Recent Notes</h3>
    <ul class="list-disc pl-5">
      <li v-for="note in noteList" :key="note.id" class="text-gray-600">
        <router-link :to="`/note/${note._id}`">
          <h3>{{ note.title }}</h3>
        </router-link>
      </li>
    </ul>
  </div>
</template>