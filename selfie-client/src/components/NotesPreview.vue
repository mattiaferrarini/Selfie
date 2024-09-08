<script lang="ts" setup>
import {defineProps, onMounted, ref, toRefs, watch} from 'vue';
import noteService from "@/services/noteService";

const props = defineProps<{
  date: Date,
  category: boolean,
  number: number
}>()

const {date, category, number} = toRefs(props)

let notes: any[] = []
const noteList = ref<any[]>([]);


const makeNoteList = (notes: any[]) => {
  // order for nearest modification date
  notes.sort((a, b) => (date.value.getTime() - new Date(a.lastmodify).getTime()) - (date.value.getTime() - new Date(b.lastmodify).getTime()));

  // limit to MAX_NOTES
  noteList.value = notes.slice(0, number.value);
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
    <ul class="list-disc pl-5">
      <li v-for="note in noteList" :key="note._id">
        <div>
          <router-link :to="`/note/${note._id}`" class="text-gray-600 flex flex-row pt-2 justify-between break-all">
            <h3>{{ note.title }}</h3>
            <p v-if="category" class="bg-purple-700 rounded-xl p-1 text-white">{{ note.category }}</p>
          </router-link>
        </div>
      </li>
    </ul>
  </div>
</template>