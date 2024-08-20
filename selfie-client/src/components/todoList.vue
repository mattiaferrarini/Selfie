<script setup lang="ts">
import {defineModel, defineProps, onBeforeMount, ref} from "vue";
import ActivityForm from "@/components/Calendar/ActivityForm.vue";
import activityService from "@/services/activityService";
import {useDateStore} from "@/stores/dateStore";
import { Activity } from '@/models/Activity';

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

const selectedActivity = ref<Activity>(new Activity());

const dateStore = useDateStore();
const currentDate = ref(new Date(dateStore.getCurrentDate()));

const showActivityForm = ref(false);
const modifying = ref(false);

const closeAddForms = () => {
  showActivityForm.value = false;
};

const saveActivity = async (newActivity: any) => {
  if (modifying.value) {
    await activityService.modifyActivity(newActivity);
  } else {
    const activity = await activityService.addActivity(newActivity);
    console.error(activity, activity.id);
    todoData.value[0].activityID = activity.id; // TODO: works for only the first
  }

  closeAddForms()
};

const deleteActivity = async (activity: any) => {
  await activityService.deleteActivity(activity);
  todoData.value[0].activityID = null;
  closeAddForms()
};

const makeActivity = (todo: any) => {
  selectedActivity.value = new Activity();
  selectedActivity.value.title = todo.title;
  selectedActivity.value.done = todo.done;
  showActivityForm.value = true;
};

const editActivity = async (todo: any) => {
  selectedActivity.value = await activityService.getActivityById(todo.activityID);
  selectedActivity.value.title = todo.title;
  selectedActivity.value.done = todo.done;
  showActivityForm.value = true;
};


</script>

<template>
  <div class="flex flex-col flex-wrap border-black border-2 rounded p-3">
    <h1 class="font-bold text-2xl">Todo List</h1>
    <div v-if="showActivityForm" class="fixed inset-0 flex justify-center items-center bg-emerald-600 z-50">
      <ActivityForm
          v-if="showActivityForm"
          @close-form="closeAddForms"
          @save-activity="saveActivity"
          @delete-activity="deleteActivity"
          :activity="selectedActivity"
          :modifying="modifying"
          :current-date="currentDate" class="m-4"/>
    </div>
    <ul>
      <li v-for="todo in todoData" :key="todo.title" class="pb-3">
        <div v-if="!todo.activityID" class="flex flex-row justify-between">
          <input type="checkbox" v-model="todo.done" :disabled="editable">
          <span>{{ todo.title }}</span>
          <button class="bg-yellow-400 rounded-lg p-1" @click="makeActivity(todo)" :disabled="editable">Make Activity</button>
        </div>
        <div v-else class="flex flex-row justify-between">
          <input type="checkbox" v-model="todo.done" disabled>
          <span>{{ todo.title }}</span>
          <button class="bg-yellow-400 rounded-lg p-1" @click="editActivity(todo)" :disabled="editable">Edit Activity</button>
        </div>
      </li>
    </ul>
    <div class="flex flex-row pt-3 gap-x-3">
      <input type="text" v-model="newTodo" class="w-full" :disabled="editable">
      <button @click="addTodo" class="bg-green-700 rounded-lg p-1" :disabled="editable">Add</button>
    </div>
  </div>
</template>