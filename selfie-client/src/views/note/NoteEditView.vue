<script setup lang="ts">
import {ref, onMounted} from "vue";
import noteService from "@/services/noteService";
import userService from "@/services/userService";
import router from "@/router";
import { useTextareaAutosize } from '@vueuse/core'
import VueMultiselect from 'vue-multiselect'
import { marked } from 'marked'
import todoList from "@/components/todoList.vue"
import {onBeforeRouteLeave, onBeforeRouteUpdate} from "vue-router";

// declaring reactive variables
const { textarea: contentArea, input: content } = useTextareaAutosize();
const { textarea: titleArea, input: title } = useTextareaAutosize();

const creation = ref();
const lastmodify = ref();
const category = ref();

// owners edit
const open_to_anyone = ref(false);
const owners = ref<string[]>([]);
const users = ref([]);

// markdown rendering
const viewMode = ref(true);
const renderedMarkdown = ref("");

// todoList
const todoData = ref<any>([]);
const todoListShow = ref(false);

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
  todoData.value = note.todoList;
  if (!todoData.value) {
    todoData.value = [];
  }
  if (owners.value.length === users.value.length) {
    open_to_anyone.value = true;
  }
};

const saveNote = async () => {
  const id = String(router.currentRoute.value.params.id);
  if (open_to_anyone.value) {
    owners.value = users.value;
  }
  await noteService.modify(id, title.value, content.value, new Date(), category.value, owners.value, todoData.value);
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

const changeViewMode = async () => {
  viewMode.value = !viewMode.value;
  if (viewMode.value) {
    renderedMarkdown.value = await marked(content.value);
  }
};

onMounted( async () => {
  await getUserNames();
  await getNote();
  renderedMarkdown.value = await marked(content.value);
})


onBeforeRouteUpdate(async () => {
  await saveNote();
})

</script>

<template>
  <div class="flex flex-col flex-wrap justify-center w-screen max-w-screen-md m-auto">
    <div class="flex flex-col">
      <div class="flex flex-row flex-wrap justify-center mt-5">
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
        <button
            type="button"
            class="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700"
            @click="changeViewMode">{{ viewMode ? "edit" : "view" }}
        </button>
      </div>

      <textarea
          ref="titleArea"
          class="w-screen max-w-screen-md font-bold text-4xl text-center resize-none p-2"
          v-model="title"
          placeholder="edit me"
          :disabled="viewMode">
      </textarea>
      <div class="flex flex-row flex-wrap justify-center">
        <p class="m-2">Creation date: {{ new Date(creation).toLocaleString() }}</p>
        <p class="m-2">Last modification {{ new Date(lastmodify).toLocaleString() }}</p>
      </div>
      <div class="flex justify-center">
        <input type="text" v-model="category" :disabled="viewMode" class="text-center m-2 bg-blue-700 rounded-lg text-white p-2">
      </div>
      <!-- show if only todoData is not empty -->
      <div>
        <todoList v-if="todoData.length > 0 || todoListShow" v-model="todoData" :editable="viewMode" class="m-2"></todoList>
        <button v-else @click="todoListShow = !todoListShow" class="bg-yellow-400 rounded p-2" :disabled="viewMode">add todo list</button>
      </div>
      <div v-if="viewMode" class="flex justify-center">
        <div v-html='renderedMarkdown' class="w-screen max-w-screen-md bg-white prose"></div>
      </div>
      <div v-else class="flex justify-center resize-none p-2" >
        <textarea
          ref="contentArea"
          class="w-screen max-w-screen-md min-h-[200px] resize-none"
          v-model="content"
          placeholder="edit me"
          :disabled="viewMode">
        </textarea>
      </div>

      <div class="flex flex-col justify-center flex-wrap w-screen max-w-screen-md m-auto p-2">
        <p class="text-center">Owners:</p>
        <div class="flex">
          <label for="open_to_anyone">open to anyone</label>
          <input class="ml-1" type="checkbox" id="open_to_anyone" v-model="open_to_anyone" :disabled="viewMode"/>
        </div>

        <VueMultiselect v-if="!open_to_anyone"
                        v-model="owners"
                        :options="users"
                        :multiple="true"
                        :disabled="viewMode">
        </VueMultiselect>

      </div>
    </div>
  </div>

</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>



