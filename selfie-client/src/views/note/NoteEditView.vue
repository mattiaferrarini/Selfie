<script setup lang="ts">
import {ref, onMounted} from "vue";
import noteService from "@/services/noteService";
import userService from "@/services/userService";
import router from "@/router";
import { useTextareaAutosize } from '@vueuse/core'
import VueMultiselect from 'vue-multiselect'
import { marked } from 'marked'
import todoList from "@/components/todoList.vue"
import {onBeforeRouteUpdate} from "vue-router";
import {useDateStore} from "@/stores/dateStore";

const dateStore = useDateStore();

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
  const date = new Date();
  await noteService.modify(id, title.value, content.value, date, category.value, owners.value, todoData.value);
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
  if (content.value.length <= 0) {
    viewMode.value = false;
  }
})


onBeforeRouteUpdate(async () => {
  await saveNote();
})

</script>

<template>
  <div class="flex flex-col flex-wrap justify-center w-screen max-w-screen-md m-auto">
    <div class="flex w-full flex-col p-3 pb-8">
      <div class="flex flex-row flex-wrapw w-full mt-2 gap-1">
        <button
            type="button"
            class="focus:outline-none flex-1 text-white bg-green-700 hover:bg-green-800 font-medium rounded-md text-sm py-2.5 mb-2 dark:bg-green-600 dark:hover:bg-green-700"
            @click="saveNote()">Save and close
        </button>
        <button
            type="button"
            class="focus:outline-none flex-1 text-white bg-red-700 hover:bg-red-800 font-medium rounded-md text-sm py-2.5 mb-2 dark:bg-red-600 dark:hover:bg-red-700"
            @click="deleteNote()">Delete
        </button>
        <button
            type="button"
            class="focus:outline-none flex-1 text-white bg-purple-700 hover:bg-purple-800 font-medium rounded-md text-sm py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700"
            @click="changeViewMode">{{ viewMode ? "Edit" : "View" }}
        </button>
      </div>

      <div class="bg-gray-300 rounded-md mt-2">
        <div class="flex flex-row flex-wrap justify-center my-2 gap-x-3">
        <p>Creation date: {{ new Date(creation).toLocaleString() }}</p>
        <p>Last modification: {{ new Date(lastmodify).toLocaleString() }}</p>
      </div>
    </div>

      <textarea
          ref="titleArea"
          class="w-full max-w-screen-md mb-2 font-bold text-2xl rounded-md text-center resize-none p-2 shadow-md bg-white mt-6 "
          v-model="title"
          placeholder="Add a title"
          :disabled="viewMode">
      </textarea>

      <div v-if="viewMode" class="flex justify-center">
        <div v-html='renderedMarkdown' class="w-screen max-w-screen-md bg-white prose rounded-md p-2 shadow-md"></div>
      </div>
      <div v-else class="flex justify-center resize-none" >
        <textarea
          ref="contentArea"
          class="w-screen max-w-screen-md min-h-[200px] resize-none rounded-md p-2 shadow-md"
          v-model="content"
          placeholder="Edit me"
          :disabled="viewMode">
        </textarea>
      </div>

      <!-- show if only todoData is not empty -->
      <div class="mt-2 w-full flex justify-center">
        <todoList v-if="todoData.length > 0 || todoListShow" v-model="todoData" :editable="viewMode" class="w-full"></todoList>
        <button v-else @click="todoListShow = !todoListShow" class="bg-yellow-400 rounded p-2 w-full shadow-md text-gray-800" :disabled="viewMode">Add todo list</button>
      </div>

      <div class="flex items-center justify-between mt-8 w-full bg-white shadow-md rounded-md p-2">
        <label for="category" class="font-bold text-lg">Category</label>
        <input type="text" id="category" v-model="category" :disabled="viewMode" class="text-center bg-blue-500 rounded-md text-white p-1">
      </div>

      <div class="flex flex-col justify-center flex-wrap w-full max-w-screen-md m-auto bg-white shadow-md rounded-md p-2 mt-2">
        <h3 class="font-bold text-lg">Owners</h3>
        <div class="flex gap-2 items-center mb-2">
          <input class="ml-1" type="checkbox" id="open_to_anyone" v-model="open_to_anyone" :disabled="viewMode"/>
          <label for="open_to_anyone">Open to anyone</label>
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