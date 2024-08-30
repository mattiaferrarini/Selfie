<script setup lang="ts">
import {defineModel, defineProps, onBeforeMount, ref} from "vue";
import ActivityForm from "@/components/Calendar/ActivityForm.vue";
import activityService from "@/services/activityService";
import {useDateStore} from "@/stores/dateStore";
import { Activity } from '@/models/Activity';
import { useAuthStore } from "@/stores/authStore";

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
  newTodo.value = ""
};

const selectedActivity = ref<Activity>(new Activity());

const dateStore = useDateStore();
const authStore = useAuthStore(); 
const currentDate = ref(new Date(dateStore.getCurrentDate()));

let index: number;

const dones = ref<boolean[]>([])
const deadlines = ref<string[]>([])
const titles = ref<string[]>([])

const showActivityForm = ref(false);
const modifying = ref(false);

const closeAddForms = () => {
  showActivityForm.value = false;
};

const saveActivity = async (newActivity: any) => {
  todoData.value[index].activityID = newActivity.id;
  dones.value[index] = newActivity.done
  deadlines.value[index] = newActivity.deadline.toLocaleDateString()
  titles.value[index] = newActivity.title

  closeAddForms()
};

const deleteActivity = async (activity: any) => {
  todoData.value[index].activityID = null;
  closeAddForms()
};

const makeActivity = (todo: any, i: number) => {
  modifying.value = false;
  selectedActivity.value = new Activity();
  selectedActivity.value.title = todo.title;
  selectedActivity.value.done = todo.done;
  index = i;
  showActivityForm.value = true;
};

const editActivity = async (todo: any, i: number) => {
  modifying.value = true;
  const activity = await activityService.getActivityById(todo.activityID);

  if(!activity.owners.includes(authStore.user.username))
    activity.owners.push(authStore.user.username);

  selectedActivity.value = activity;

  index = i;
  showActivityForm.value = true;
};

onBeforeMount(async () => {
  for (let i = 0; i < todoData.value.length; i++) {
    if (todoData.value[i].activityID) {
      try{
        const activity = await activityService.getActivityById(todoData.value[i].activityID);
        dones.value[i] = activity.done
        deadlines.value[i] = activity.deadline.toLocaleDateString()
        titles.value[i] = activity.title
      }
      catch{
        todoData.value[i].activityID = null;
      }
    }
  }
})

</script>

<template>
  <div class="flex flex-col flex-wrap border-black border-2 rounded p-3">
    <h1 class="font-bold text-2xl">Todo List</h1>
    <div v-if="showActivityForm" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <ActivityForm
          v-if="showActivityForm"
          @close-form="closeAddForms"
          @save-activity="saveActivity"
          @delete-activity="deleteActivity"
          :activity="selectedActivity"
          :modifying="modifying"
          :sub-activities-allowed="false"
          :current-date="currentDate" class="m-4"/>
    </div>
    <ul>
      <li v-for="(todo, i) in todoData" :key="todo.title" class="pb-3">
        <div v-if="!todo.activityID" class="flex flex-row justify-between">
          <input type="checkbox" v-model="todo.done" :disabled="editable">
          <span>{{ todo.title }}</span>
          <button class="bg-yellow-400 rounded-lg p-1" @click="makeActivity(todo, i)" :disabled="editable">Make Activity</button>
        </div>
        <div v-else class="flex flex-row justify-between">
          <input type="checkbox" :checked="dones[i]" disabled>
          <span>{{ titles[i] }}</span>
          <span>Deadline: {{ deadlines[i] }}</span>
          <button class="bg-yellow-400 rounded-lg p-1" @click="editActivity(todo, i)" :disabled="editable">Edit Activity</button>
        </div>
      </li>
    </ul>
    <div class="flex flex-row pt-3 gap-x-3">
      <input type="text" v-model="newTodo" class="w-full" :disabled="editable">
      <button @click="addTodo" class="bg-green-700 rounded-lg p-1" :disabled="editable">Add</button>
    </div>
  </div>
</template>