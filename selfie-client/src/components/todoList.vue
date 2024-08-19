<script setup lang="ts">
import {defineModel, defineProps, ref} from "vue";
import ActivityForm from "@/components/Calendar/ActivityForm.vue";

const todoData: any = defineModel()
defineProps<{
  editable: boolean
}>()

const newTodo = ref("");

const addTodo = () => {
  todoData.value.push({
    title: newTodo.value,
    done: false
  });
};

const makeActivity = (todo: any) => {
  let o = 0;
};

</script>

<template>
  <div class="flex flex-col flex-wrap border-black border-2 rounded p-3">
    <h1 class="font-bold text-2xl">Todo List</h1>
    <ul>
      <li v-for="todo in todoData" :key="todo.title" class="pb-3">
        <div v-if="!todo.activityID" class="flex flex-row justify-between">
          <input type="checkbox" v-model="todo.done" :disabled="editable">
          <span>{{ todo.title }}</span>
          <button class="bg-yellow-400 rounded-lg p-1" @click="makeActivity(todo)" :disabled="editable">Make Activity</button>
        </div>
        <div v-else>
          <p>leses</p>
        </div>
      </li>
    </ul>
    <div class="flex flex-row pt-3 gap-x-3">
      <input type="text" v-model="newTodo" class="w-full" :disabled="editable">
      <button @click="addTodo" class="bg-green-700 rounded-lg p-1" :disabled="editable">Add</button>
    </div>
  </div>
</template>