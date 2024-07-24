<script lang="ts">
import {ref, computed, nextTick, defineComponent, Ref} from 'vue';

export default defineComponent({
  name: 'CalendarView',
  setup() {
    const currentDate = ref(new Date());
    const days = ref([
      {date:new Date(), events:[]},
    ]);
    const showOptions=ref(false);
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
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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

    const toggleOptionsVisibility = () => {
      showOptions.value = !showOptions.value;
    };

    const hideOptions = () => {
      showOptions.value = false;
    };

    const onViewChange = (event: Event) => {
      console.log(`View changed to: ${view.value}`);
    };

    const onContentChange = (event: Event) => {
      console.log(`View changed to: ${content.value}`);
    };

    return {
      days,
      currentMonthAndYear,
      next,
      prev,
      resetCalendar,
      openAddForm,
      toggleOptionsVisibility,
      hideOptions,
      showOptions,
      view,
      content,
      onViewChange,
      onContentChange,
      showAddForm
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
          <!--
          <div v-click-outside="hideOptions">
            <button @click="toggleOptionsVisibility"><v-icon name="co-options"></v-icon></button>
            <div v-if="showOptions" class="absolute right-1  top-12 sm:top-16 bg-white border-2 border-emerald-900 p-4 rounded-lg shadow shadow-emerald-800 z-10">
              <form>
                <h2>View</h2>
                <label class="mr-2"><input type="radio" name="viewType" value="day">Day</label>
                <label class="mr-2"><input type="radio" name="viewType" value="week">Week</label>
                <label><input type="radio" name="viewType" value="month" checked>Month</label>
                <div>
                  <button @click="hideOptions" class="w-full flex-x-1 p-1 mt-2">
                    <v-icon name="bi-save"></v-icon> Export Calendar
                  </button>
                </div>
                <div class="w-full flex space-x-1 mt-2">
                  <button @click="hideOptions" class="flex-1 p-1">Close</button>
                  <button type="submit" class="flex-1 p-1">Save</button>
                </div>
              </form>
            </div>
          </div>
          -->
        </div>
      </nav>

      <div class="flex items-center">
        <div class="flex items-center">
          <h2>{{ currentMonthAndYear }}</h2>
          <button @click="resetCalendar"><v-icon name="bi-chevron-expand"></v-icon></button>
        </div>
      </div>

      <button @click="openAddForm" class="fixed bottom-4 right-4 bg-emerald-600 text-white p-2 rounded-full h-12 w-12 flex items-center justify-center">
        <v-icon name="md-add"></v-icon>
      </button>

      <div v-if="showAddForm" class="fixed inset-0 flex justify-center items-center bg-transparent">
        <form action="">
          <label>Title<input type="text"></label><br>
          <label>Start<input type="date"><input type="time"></label>
        </form>
      </div>
    </div>
</template>

<style scoped>
  .button-group button {
    border: 1px solid #ccc;
    border-radius: 5px;
  }
</style>