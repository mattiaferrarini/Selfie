<script lang="ts">
import { ref, defineComponent, watch } from "vue";
import noteService from "@/services/noteService";
import router from "@/router";
import { useTextareaAutosize } from '@vueuse/core'
import VueMultiSelect from 'vue-multiselect'


export default defineComponent({
  setup() {
    const { textarea: textarea1, input: content } = useTextareaAutosize();
    const { textarea: textarea2, input: title } = useTextareaAutosize();

    const creation = ref();
    const lastmodify = ref();
    const category = ref();
    const owners = ref();

    let id = "";

    const getnote = async () => {
      id = String(router.currentRoute.value.params.id);
      let note = await noteService.getid(id);
      title.value = note.title;
      content.value = note.content;
      creation.value = note.creation;
      lastmodify.value = note.lastmodify;
      category.value = note.category;
      owners.value = note.owners;
    };


    const savenote = async () => {
      await noteService.modify(id, title.value, content.value, new Date(), category.value, owners.value);
      await router.push("/note");
    };

    const deletenote = async () => {
      await noteService.remove(id);
      await router.push("/note");
    };

    return {
      getnote,
      savenote,
      deletenote,
      title,
      content,
      creation,
      lastmodify,
      category,
      owners,
      textarea1,
      textarea2,
      VueMultiSelect,
    };
  },

  mounted() {
      this.getnote();
  },
});
</script>


<template>
  <div class="flex flex-col">
    <div class="flex flex-row flex-wrap justify-center">
      <button
          type="button"
          class="focus:outline-none text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700"
          @click="savenote()">save and close
      </button>
      <button
          type="button"
          class="focus:outline-none text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700"
          @click="deletenote()">delete
      </button>
    </div>
    <div class="flex justify-center">
      <textarea
          ref="textarea2"
          class="w-screen max-w-screen-md text-2xl text-center resize-none"
          v-model="title"
          placeholder="edit me"
      />
    </div>
    <div class="flex justify-center">
      <input type="text" v-model="category" class="text-center m-2 focus:outline-none text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700">
    </div>
    <div class="flex flex-row flex-wrap justify-center">
      <p class="m-2">Creation date: {{ creation }}</p>
      <p class="m-2">Last modification {{ lastmodify }}</p>
    </div>

    <div class="flex justify-center resize-none" >
      <textarea
          ref="textarea1"
          class="w-screen max-w-screen-md min-h-[200px] resize-none"
          v-model="content"
          placeholder="edit me">
      </textarea>
    </div>

    <div>
      <p>Owners:</p>
      <VueMultiselect
        v-model="owners">
        </VueMultiselect>
    </div>


  </div>
</template>

<style scoped>

</style>