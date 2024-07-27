<script setup lang="ts">
import {ref, defineComponent, onMounted} from "vue";
import noteService from "@/services/noteService";
import userService from "@/services/userService";
import router from "@/router";
import { useTextareaAutosize } from '@vueuse/core'
import VueMultiselect from 'vue-multiselect'

// declaring reactive variables variables
const { textarea: contentArea, input: content } = useTextareaAutosize();
const { textarea: ctitleArea, input: title } = useTextareaAutosize();

const creation = ref();
const lastmodify = ref();
const category = ref();

// ownsers edit
const owners = ref(null);
const users = ref([]);

// useful functions

const getNote = async () => {
  const id = String(router.currentRoute.value.params.id);
  let note = await noteService.getid(id);
  title.value = note.title;
  content.value = note.content;
  creation.value = note.creation;
  lastmodify.value = note.lastmodify;
  category.value = note.category;
  owners.value = note.owners;
};

const saveNote = async () => {
  const id = String(router.currentRoute.value.params.id);
  await noteService.modify(id, title.value, content.value, new Date(), category.value, owners.value);
  await router.push("/note");
};

const deleteNote = async () => {
  const id = String(router.currentRoute.value.params.id);
  await noteService.remove(id);
  await router.push("/note");
};

const getUserNames = async () => {
  users.value = await userService.getUserNames();
};

onMounted( async () => {
  await getNote();
  await getUserNames();
})

const selected = ref(null);
const options = ref(['list', 'of', 'options']);

</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-row flex-wrap justify-center">
      <button
          type="button"
          class="focus:outline-none text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700"
          @click="saveNote()">save and close
      </button>
      <button
          type="button"
          class="focus:outline-none text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700"
          @click="deleteNote()">delete
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

    <div class="flex flex-col justify-center flex-wrap w-screen max-w-screen-md m-auto">
      <p class="text-center">Owners:</p>
      <VueMultiselect
          v-model="owners"
          :options="users"
          :multiple="true"
          >
      </VueMultiselect>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>



