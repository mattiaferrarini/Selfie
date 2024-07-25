<script lang="ts">
import {ref, computed, nextTick, defineComponent, Ref} from 'vue';
import {DatePickerInstance} from "@vuepic/vue-datepicker";

export default defineComponent({
  name: 'CalendarView',
  setup() {
    const currentDate = ref(new Date());
    const days = ref([
      {date:new Date(), events:[]},
    ]);
    const view = ref('month');
    const content = ref('all');
    const showAddForm=ref(false);

    const next = () => {
      if(view.value === 'day') {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), currentDate.value.getDate() + 1);
      } else if(view.value === 'week') {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), currentDate.value.getDate() + 7);
      } else {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
      }
    };

    const prev = () => {
      if(view.value === 'day') {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), currentDate.value.getDate() - 1);
      } else if(view.value === 'week') {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), currentDate.value.getDate() - 7);
      } else {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
      }
    };

    const currentMonthAndYear = computed(() => {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const month = months[currentDate.value.getMonth()];
      const year = currentDate.value.getFullYear();
      return `${month} ${year}`;
    });

    const resetCalendar = () => {
      currentDate.value = new Date();
    };

    const openAddForm = () => {
      showAddForm.value = true;
    };

    const closeAddForm = (event: MouseEvent) => {
      if(event){
        const openButton = document.getElementById('open-add-form-btn');
        if (openButton && event.target !== openButton && !openButton.contains(event.target as Node)) {
          showAddForm.value = false;
        }
      }
      else{
        showAddForm.value = false;
      }
    };

    const onViewChange = () => {
      console.log(`View changed to: ${view.value}`);
    };

    const onContentChange = () => {
      console.log(`View changed to: ${content.value}`);
    };

    return {
      days,
      currentMonthAndYear,
      next,
      prev,
      resetCalendar,
      openAddForm,
      closeAddForm,
      view,
      content,
      onViewChange,
      onContentChange,
      showAddForm,
      currentDate,
    };
  },
});
</script>

<template>
    <div class="calendar-view">
      <nav class="container mx-auto flex justify-between items-center text-gray-700 p-1 sm:p-2">
        <div>
          <select id="view" name="view" v-model="view" class="mr-2" @change="onViewChange">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
          <select id="content" name="content" v-model="content" @change="onContentChange">
            <option value="events">Events</option>
            <option value="activities">Activities</option>
            <option value="all">All</option>
          </select>
        </div>
        <div class="flex items-center button-group">
          <button @click="resetCalendar"><v-icon name="fa-undo"></v-icon></button>
          <div class="flex items-center">
            <button @click="prev"><v-icon name="md-navigatebefore"></v-icon></button>
            <button @click="next"><v-icon name="md-navigatenext"></v-icon></button>
          </div>
        </div>
      </nav>

      <VueDatePicker v-model="currentDate" :auto-apply="true" :enableTimePicker="false">
        <template #trigger>
          <div class="clickable-text flex items-center justify-center">
            <h2>{{ currentMonthAndYear }}</h2>
            <v-icon name="bi-chevron-expand"></v-icon>
          </div>
        </template>
      </VueDatePicker>

      <button @click="openAddForm" id="open-add-form-btn" class="fixed bottom-4 right-4 bg-emerald-600 text-white p-2 rounded-full h-12 w-12 flex items-center justify-center">
        <v-icon name="md-add"></v-icon>
      </button>

      <div v-if="showAddForm" class="fixed inset-0 flex justify-center items-center bg-emerald-600 z-50" @click="closeAddForm">
        <div class="bg-white p-4 rounded-lg shadow-lg" @click.stop>
          <form action="">
            <label>Title<input type="text"></label><br>
            <label>Start<input type="date"><input type="time"></label>
          </form>
        </div>
      </div>

    </div>
</template>

<style scoped>
  .button-group button {
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  .hidden-input .vue-datepicker-input {
    display: none;
  }
</style>