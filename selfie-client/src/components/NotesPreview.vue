<template>
  <div class="p-4 bg-white rounded-lg shadow border m-4">
    <h3 class="text-lg font-semibold text-gray-800">Recent Notes</h3>
    <ul class="list-disc pl-5">
      <li v-for="note in notes" :key="note.id" class="text-gray-600"><h3>{{ note.title }}</h3>{{ desc ? note.content : '' }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    date: {
      type: Date,
      required: true,
    },
    desc: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      notes: [
        { id: 1, title: "Note 1", content: "This is the content of Note 1"},
        { id: 2, title: "Note 2", content: "This is the content of Note 2"},
        { id: 3, title: "Note 3", content: "This is the content of Note 3"},
        // Add more notes here
      ],
    };
  },
});
</script>