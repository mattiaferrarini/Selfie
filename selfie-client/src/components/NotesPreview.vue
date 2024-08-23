<script setup lang="ts">
import {defineProps, onMounted, toRefs, watch} from 'vue';
import { ref } from 'vue';
import noteService from "@/services/noteService";

const props = defineProps< {
  date: Date,
  category: boolean,
  number: number
}>()

const { date, category, number } = toRefs(props)

let notes: any[] = []
const noteList = ref<any[]>([]);


const makeNoteList = (notes: any[]) => {
  // order for nearest modification date
  notes.sort((a, b) => (date.value.getTime() - new Date(a.lastmodify).getTime()) - (date.value.getTime() - new Date(b.lastmodify).getTime()));

  // limit to MAX_NOTES
  noteList.value =  notes.slice(0, number.value);
}

watch(number, () => {
  makeNoteList(notes);
})

onMounted(async () => {
  notes = await noteService.getall();
  makeNoteList(notes);
});

</script>

<template>
  <div class="p-4 bg-white rounded-lg shadow border">
    <h3 class="text-lg font-semibold text-gray-800">Recent Notes</h3>
    <ul class="list-disc">
      <!--<router-link v-for="note in noteList" :key="note._id" :to="`/note/${note._id}`">
        <li class="text-gray-600 flex flex-row justify-between pt-2">
          <h3>{{ note.title }}</h3>
          <p v-if="category" class="bg-purple-700 rounded-xl p-1 text-white">{{ note.category }}</p>
        </li>
      </router-link>-->
      <li v-for="note in noteList" :key="note._id">
        <router-link :to="`/note/${note._id}`">
          <div class="text-gray-600 flex flex-row justify-between pt-2">
            <h3>{{ note.title }}</h3>
            <p v-if="category" class="bg-purple-700 rounded-xl p-1 text-white">{{ note.category }}</p>
          </div>
        </router-link>
      </li>
    </ul>
  </div>
</template>