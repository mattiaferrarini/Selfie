<script lang="ts">
import { ref, computed, nextTick, defineComponent, Ref, onMounted } from 'vue';
import EventForm from "@/components/Calendar/EventForm.vue";
import ActivitiesList from "@/components/Calendar/ActivitiesList.vue";
import AppointmentsCalendar from "@/components/Calendar/AppointmentsCalendar.vue";
import ActivityForm from "@/components/Calendar/ActivityForm.vue";
import UnavailabilityForm from '@/components/Calendar/UnavailabilityForm.vue';
import timeMethods from '@/services/timeService';
import { CalendarEvent } from '@/models/Event';
import { Activity } from '@/models/Activity';
import { Unavailability } from '@/models/Unavailability';
import { useAuthStore } from '@/stores/authStore';

export default defineComponent({
  name: 'CalendarView',
  components: {
    EventForm,
    AppointmentsCalendar,
    ActivitiesList,
    ActivityForm,
    UnavailabilityForm
  },
  setup() {
    const currentDate = ref(new Date());
    const rangeStartDate = ref(new Date());
    const rangeEndDate = ref(new Date());
    const rangeEvents = ref([
      {
        id: 1,
        title: "Event 1",
        start: new Date(2024, 6, 1),
        end: new Date(2024, 6, 2)
      },
      {
        id: 2,
        title: "Event 2",
        start: new Date(2024, 6, 3),
        end: new Date(2024, 6, 5)
      },
      {
        id: 3,
        title: "Event 3",
        start: new Date(2024, 6, 5),
        end: new Date(2024, 6, 6)
      },
      {
        id: 4,
        title: "Event 4",
        start: new Date(2024, 6, 3, 9, 0),
        end: new Date(2024, 6, 3, 10, 30)
      },
    ]);

    const rangeActivities = ref([
      {
        id: 1,
        title: "Activity 1",
        deadline: new Date(2024, 6, 1),
        done: false
      },
      {
        id: 2,
        title: "Activity 2",
        deadline: new Date(2024, 6, 2),
        done: false
      },
      {
        id: 3,
        title: "Activity 3",
        deadline: new Date(2024, 6, 3),
        done: false
      },
      {
        id: 4,
        title: "Activity 4",
        deadline: new Date(2024, 6, 3),
        done: false
      },
    ]);

    const rangeUnavailabilities = ref([
      {
        id: 1,
        title: "Unavailability 1",
        start: new Date(2024, 6, 1),
        end: new Date(2024, 6, 2)
      },
      {
        id: 2,
        title: "Unavailability 2",
        start: new Date(2024, 6, 3),
        end: new Date(2024, 6, 5)
      },
      {
        id: 3,
        title: "Unavailability 3",
        start: new Date(2024, 6, 5),
        end: new Date(2024, 6, 6)
      },
      {
        id: 4,
        title: "Unavailability 4",
        start: new Date(2024, 6, 3, 9, 0),
        end: new Date(2024, 6, 3, 10, 30)
      },
    ]);

    const setRangeDates = () => {
      const firstDayOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0);

      const firstDayOfWeek = new Date(firstDayOfMonth);
      firstDayOfWeek.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

      const lastDayOfWeek = new Date(lastDayOfMonth);
      lastDayOfWeek.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

      rangeStartDate.value = firstDayOfWeek;
      rangeEndDate.value = lastDayOfWeek;
    };

    // variables to control what is displayed
    const view = ref('day');
    const content = ref('appointments');
    const showAddOptions = ref(false);
    const showEventForm = ref(false);
    const showActivityForm = ref(false);
    const showUnavailabilityForm = ref(false);

    const newParticipants = ref([
      {
        username: 'Jane Doe',
        status: 'accepted'
      },
      {
        username: 'John Doe',
        status: 'pending'
      },
      {
        username: 'Jack Doe',
        status: 'declined'
      }
    ]);

    const newEvent = ref<CalendarEvent>(new CalendarEvent());
    const newActivity = ref<Activity>(new Activity());
    const newUnavailability = ref<Unavailability>(new Unavailability());

    const next = () => {
      currentDate.value = timeMethods.nextCurrentDate(currentDate.value, view.value);
    };

    const prev = () => {
      currentDate.value = timeMethods.prevCurrentDate(currentDate.value, view.value);
    };

    const resetCalendar = () => {
      currentDate.value = new Date();
    };

    const openAddOptions = () => {
      showAddOptions.value = true;
    };
    const closeAddOptions = () => {
      showAddOptions.value = false;
    };

    const openAddEventForm = () => {
      newEvent.value = new CalendarEvent();

      newEvent.value.start = timeMethods.roundTime(currentDate.value);
      newEvent.value.end = timeMethods.moveAheadByHours(newEvent.value.start, 1);
      newEvent.value.repetition.endDate = new Date(newEvent.value.end);
      newEvent.value.participants = [{username: useAuthStore().user.username, status: 'accepted'}];

      showEventForm.value = true;
    };

    const openAddActivityForm = () => {
      newActivity.value = new Activity();
      newActivity.value.deadline = timeMethods.moveAheadByDays(currentDate.value, 7);
      showActivityForm.value = true;
    };

    const openUnavailabilityForm = () => {
      newUnavailability.value = new Unavailability();
      newUnavailability.value.start = timeMethods.roundTime(currentDate.value);
      newUnavailability.value.end = timeMethods.moveAheadByHours(newUnavailability.value.start, 1);
      newUnavailability.value.repetition.endDate = new Date(newUnavailability.value.end);
      showUnavailabilityForm.value = true;
    };

    const closeAddForms = (event: MouseEvent) => {
      if (event) {
        const openButton = document.getElementById('open-add-form-btn');
        if (openButton && event.target !== openButton && !openButton.contains(event.target as Node)) {
          hideAllForms();
        }
      }
      else {
        hideAllForms();
      }
    };

    const hideAllForms = () => {
      showEventForm.value = false;
      showActivityForm.value = false;
      showUnavailabilityForm.value = false;
      showAddOptions.value = false;
    };

    const onViewChange = () => {
      console.log(`View changed to: ${view.value}`);
    };

    const onContentChange = () => {
      console.log(`View changed to: ${content.value}`);
    };

    const saveEvent = (newEvent: any) => {
      //TODO: Save event to database
      rangeEvents.value.push(newEvent);
    };

    const saveActivity = (newActivity: any) => {
      //TODO: Save activity to database
      rangeActivities.value.push(newActivity);
    };

    const saveUnavailability = (newUnav: any) => {
      //TODO: Save activity to database
      rangeUnavailabilities.value.push(newUnav);
    };

    const showForm = computed(() => {
      return showEventForm.value || showActivityForm.value || showUnavailabilityForm.value;
    });

    const showAppointments = computed(() => {
      return content.value === 'appointments' || content.value === 'events' || content.value === 'unavailabilities';
    });

    const modifyEvent = (event: CalendarEvent) => {
      newEvent.value = event;
      showEventForm.value = true;
    };

    const modifyActivity = (activity: Activity) => {
      newActivity.value = activity;
      showActivityForm.value = true;
    };

    const modifyUnavailability = (unavailability: Unavailability) => {
      newUnavailability.value = unavailability;
      showUnavailabilityForm.value = true;
    };

    const markAsDone = (activity: Activity) => {
      activity.done = true;
      console.log('Activity marked as done:', activity);
    };

    const undoActivity = (activity: Activity) => {
      activity.done = false;
      console.log('Activity marked as not done:', activity);
    };

    onMounted(() => {
      setRangeDates();
    });

    const currentDisplayedPeriodString = computed(() => {
      if (view.value === 'day') {
        return timeMethods.formatDayMonth(currentDate.value);
      } else if (view.value === 'week') {
        const firstDay = timeMethods.getFirstDayOfWeek(currentDate.value);
        const lastDay = timeMethods.getLastDayOfWeek(currentDate.value);
        return `${timeMethods.formatDayMonth(firstDay)} - ${timeMethods.formatDayMonth(lastDay)}`;
      } else {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const month = months[currentDate.value.getMonth()];
        const year = currentDate.value.getFullYear();
        return `${month} ${year}`;
      }
    });

    return {
      next, prev, resetCalendar, closeAddForms, view, content, onViewChange, onContentChange, showEventForm,
      showActivityForm, showUnavailabilityForm, currentDate, setRangeDates, saveEvent, showForm, saveActivity, rangeEvents, showAppointments,
      modifyEvent, rangeActivities, modifyActivity, markAsDone, undoActivity, rangeUnavailabilities, saveUnavailability,
      showAddOptions, openAddOptions, closeAddOptions, currentDisplayedPeriodString, modifyUnavailability,
      newParticipants, newEvent, newActivity, newUnavailability, openAddEventForm, openAddActivityForm, openUnavailabilityForm
    };
  },
});
</script>

<template>
  <div class="calendar-view">
    <nav class="flex justify-between text-gray-700 p-4 sm:p-8">
      <div>
        <select id="view" name="view" v-model="view" class="mr-2 p-1 h-full rounded" @change="onViewChange">
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
        <select id="content" name="content" v-model="content" @change="onContentChange" class="p-1 h-full rounded">
          <option value="appointments">Appointments</option>
          <option value="events">Events</option>
          <option value="activities">Activities</option>
          <option value="unavailabilities">Unavailabilities</option>
          <option value="events">Resources</option>
        </select>
      </div>
      <div class="flex items-center button-group">
        <button @click="resetCalendar" class="p-1"><v-icon name="fa-undo"></v-icon></button>
        <div class="flex items-center">
          <button @click="prev" class="p-1"><v-icon name="md-navigatebefore"></v-icon></button>
          <button @click="next" class="p-1"><v-icon name="md-navigatenext"></v-icon></button>
        </div>
      </div>
    </nav>

    <VueDatePicker v-model="currentDate" :auto-apply="true" :enableTimePicker="false">
      <template #trigger>
        <div class="clickable-text flex items-center justify-center">
          <h2 class="text-2xl font-semibold">{{ currentDisplayedPeriodString }}</h2>
          <v-icon name="bi-chevron-expand"></v-icon>
        </div>
      </template>
    </VueDatePicker>

    <AppointmentsCalendar v-if="showAppointments" @modifyEvent="modifyEvent" @modifyActivity="modifyActivity"
      @undoActivity="undoActivity" @markAsDone="markAsDone" @modify-unavailability="modifyUnavailability"
      :currentDate="currentDate" :view="view" :allEvents="rangeEvents"
      :include-events="content === 'appointments' || content === 'events'"
      :includeActivities="content === 'appointments'" :allActivities="rangeActivities"
      :all-unavailabilities="rangeUnavailabilities" :include-unavailable="content === 'unavailabilities'" />

    <ActivitiesList v-if="content === 'activities'" @modify-activity="modifyActivity" @mark-as-done="markAsDone"
      @undo-activity="undoActivity" :activities="rangeActivities" :current-date="currentDate" :view="view" />

    <div class="flex flex-col fixed bottom-4 right-4" v-click-outside="closeAddOptions">
      <ul class="mr-4 mb-4 self-start" v-if="showAddOptions">
        <li><button class="add-button" @click="openAddEventForm">Event</button></li>
        <li><button class="add-button" @click="openAddActivityForm">Activity</button></li>
        <li><button class="add-button" @click="openUnavailabilityForm">Unavailability</button></li>
      </ul>
      <button @click="openAddOptions" id="open-add-form-btn"
        class="bg-emerald-600 text-white p-2 rounded-full h-12 w-12 flex items-center justify-center self-end">
        <v-icon name="md-add"></v-icon>
      </button>
    </div>

    <div v-if="showForm" class="fixed inset-0 flex justify-center items-center bg-emerald-600 z-50"
      @click="closeAddForms">
      <EventForm v-if="showEventForm" @close-form="closeAddForms" @save-event="saveEvent" :event="newEvent" />
      <ActivityForm v-if="showActivityForm" @close-form="closeAddForms" @save-activity="saveActivity"
        :activity="newActivity" />
      <UnavailabilityForm v-if="showUnavailabilityForm" @close-form="closeAddForms"
        @save-unavailability="saveUnavailability" :unavailability="newUnavailability" />
    </div>

  </div>
</template>

<style>
.button-group button {
  border: 1px solid #ccc;
  border-radius: 5px;
}

:root {
  --dp-input-icon-padding: 10px;
}

.add-button {
  width: 100%;
  text-align: left;
  background-color: #f2f2f2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.5em 1em;
  border: 1px solid #ccc;
}
</style>