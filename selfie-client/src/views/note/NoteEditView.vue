<script lang="ts">
import { ref, defineComponent, watch } from "vue";
import noteService from "@/services/noteService";
import router from "@/router";

export default defineComponent({
  setup() {

    const title = ref();
    const content = ref();
    const creation = ref();
    const lastmodify = ref();

    const getnote = async () => {
      let id = String(router.currentRoute.value.params.id);
      let note = await noteService.getid(id);
      title.value = note.title;
      content.value = note.content;
      creation.value = note.creation;
      lastmodify.value = note.lastmodify;
    };


    return {
      getnote,
      title,
      content,
      creation,
      lastmodify
    };
  },

  mounted() {
      this.getnote();
  },
});
</script>

<template>
   <h1>NOTE EDIT</h1>
    <div class="flex flex-wrap justify-center m-4">
      <div class="max-w-sm rounded overflow-hidden shadow-lg">
        <div class="px-6 py-4">
          <div class="font-bold text-xl mb-2 break-words">
            <input v-model="title" class="w-full px-3 py-2 mb-3 border rounded" placeholder="Title"/>
          </div>
          <p class="text-gray-700 text-base break-words">
            <textarea v-model="content" class="w-full px-3 py-2 mb-3 border rounded" placeholder="Content"/>
          </p>
          <p class="text-gray-700 text-base break-words">
            creation: {{ creation }}
          </p>
          <p class="text-gray-700 text-base break-words">
            last modify: {{ lastmodify }}
          </p>
        </div>
      </div>
 </div>
</template>

<style scoped>

</style>