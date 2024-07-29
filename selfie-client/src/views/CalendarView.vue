<script lang="ts">
import { ref, computed, nextTick, defineComponent, Ref, onMounted } from 'vue';
import { DatePickerInstance } from "@vuepic/vue-datepicker";
import EventForm from "@/components/Calendar/EventForm.vue";
import ActivitiesList from "@/components/Calendar/ActivitiesList.vue";
import AppointmentsCalendar from "@/components/Calendar/AppointmentsCalendar.vue";
import ActivityForm from "@/components/Calendar/ActivityForm.vue";
import UnavailabilityForm from '@/components/Calendar/UnavailabilityForm.vue';
import timeMethods from '@/components/Calendar/timeMethods';

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

    // variables for event form
    const newTitle = ref("");
    const newAllDay = ref(false);
    const newStartDate = ref(new Date());
    const newStartTime = ref("");
    const newEndDate = ref(new Date());
    const newEndTime = ref("");
    const newRepeat = ref("never");
    const newUntil = ref("infinity");
    const newNumberOfReps = ref(1);
    const newRepeatEndDate = ref(new Date());
    const notificationOptions = ref({
      os: false,
      email: false,
      whatsapp: false
    });
    const newWhenNotify = ref("atEvent");
    const newRepatNotify = ref("never");

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

    // variables for activity form
    const newDone = ref(false);

    const next = () => {
      if (view.value === 'day') {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), currentDate.value.getDate() + 1);
      } else if (view.value === 'week') {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), currentDate.value.getDate() + 7);
      } else {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
      }
    };

    const prev = () => {
      if (view.value === 'day') {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), currentDate.value.getDate() - 1);
      } else if (view.value === 'week') {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), currentDate.value.getDate() - 7);
      } else {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
      }
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

    const openAddForm = () => {
      newStartDate.value = currentDate.value;
      newEndDate.value = currentDate.value;
      newRepeatEndDate.value = currentDate.value;

      const now = new Date();
      let minutes = Math.round(now.getMinutes() / 5) * 5;
      let hours = now.getHours();
      hours = minutes === 60 ? hours + 1 : hours;
      minutes = minutes === 60 ? 0 : minutes;
      newStartTime.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      let endMinutes = Math.round(oneHourLater.getMinutes() / 5) * 5;
      let endHours = oneHourLater.getHours();
      endHours = endMinutes === 60 ? endHours + 1 : endHours;
      endMinutes = endMinutes === 60 ? 0 : endMinutes;
      newEndTime.value = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

      showEventForm.value = true;
    };

    const closeAddForm = (event: MouseEvent) => {
      if (event) {
        const openButton = document.getElementById('open-add-form-btn');
        if (openButton && event.target !== openButton && !openButton.contains(event.target as Node)) {
          showEventForm.value = false;
        }
      }
      else {
        showEventForm.value = false;
      }
    };

    const onViewChange = () => {
      console.log(`View changed to: ${view.value}`);
    };

    const onContentChange = () => {
      console.log(`View changed to: ${content.value}`);
    };

    const closeEventForm = () => {
      showEventForm.value = false;
      console.log('Event form closed');
      // TODO: complete
    };

    const saveEvent = (newEvent: any) => {
      //TODO: Save event to database
      rangeEvents.value.push(newEvent);
    };

    const closeActivityForm = () => {
      showActivityForm.value = false;
      console.log('Activity form closed');
      // TODO: complete
    };

    const saveActivity = (newActivity: any) => {
      //TODO: Save activity to database
      rangeActivities.value.push(newActivity);
    };

    const closeUnavailabilityForm = () => {
      showUnavailabilityForm.value = false;
      console.log('Activity form closed');
      // TODO: complete
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

    const modifyEvent = (event: any) => {
      console.log('Event modified:', event);
    };

    const modifyActivity = (activity: any) => {
      console.log('Activity modified:', activity);
    };

    const markAsDone = (activity: any) => {
      activity.done = true;
      console.log('Activity marked as done:', activity);
    };

    const undoActivity = (activity: any) => {
      activity.done = false;
      console.log('Activity marked as not done:', activity);
    };

    const modifyUnavailability = (unavailability: any) => {
      console.log('Unavailability modified:', unavailability);
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
      next, prev, resetCalendar, openAddForm, closeAddForm, view, content, onViewChange, onContentChange, showEventForm,
      showActivityForm, showUnavailabilityForm, currentDate, newAllDay, newStartDate, newStartTime, newEndDate, newEndTime,
      newRepeat, newUntil, newNumberOfReps, newRepeatEndDate, notificationOptions, newWhenNotify, newRepatNotify, setRangeDates,
      newTitle, saveEvent, showForm, closeEventForm, closeActivityForm, saveActivity, rangeEvents, showAppointments, modifyEvent,
      rangeActivities, modifyActivity, markAsDone, undoActivity, newDone, rangeUnavailabilities, saveUnavailability,
      closeUnavailabilityForm, showAddOptions, openAddOptions, closeAddOptions, currentDisplayedPeriodString, modifyUnavailability,
      newParticipants
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
      @undoActivity="undoActivity" @markAsDone="markAsDone" @modify-unavailability="modifyUnavailability" :currentDate="currentDate" :view="view"
      :allEvents="rangeEvents" :include-events="content === 'appointments' || content === 'events'"
      :includeActivities="content === 'appointments'" :allActivities="rangeActivities"
      :all-unavailabilities="rangeUnavailabilities" :include-unavailable="content==='unavailabilities'"/>

    <ActivitiesList v-if="content === 'activities'" @modify-activity="modifyActivity" @mark-as-done="markAsDone"
      @undo-activity="undoActivity" :activities="rangeActivities" :current-date="currentDate" :view="view" />

    <div class="flex flex-col fixed bottom-4 right-4" v-click-outside="closeAddOptions">
      <ul class="mr-4 mb-4 self-start" v-if="showAddOptions">
        <li><button class="add-button" @click="openAddForm">Event</button></li>
        <li><button class="add-button" @click="openAddForm">Activity</button></li>
        <li><button class="add-button">Unavailability</button></li>
      </ul>
      <button @click="openAddOptions" id="open-add-form-btn"
        class="bg-emerald-600 text-white p-2 rounded-full h-12 w-12 flex items-center justify-center self-end">
        <v-icon name="md-add"></v-icon>
      </button>
    </div>

    <div v-if="showForm" class="fixed inset-0 flex justify-center items-center bg-emerald-600 z-50"
      @click="closeAddForm">
      <EventForm v-if="showEventForm" @close-event-form="closeEventForm" @save-event="saveEvent" :title="newTitle"
        :allDay="newAllDay" :startDate="newStartDate" :startTime="newStartTime" :endDate="newEndDate"
        :endTime="newEndTime" :repeat="newRepeat" :until="newUntil" :numberOfReps="newNumberOfReps"
        :repeatEndDate="newRepeatEndDate" :notificationOptions="notificationOptions" :whenNotify="newWhenNotify"
        :repeatNotify="newRepatNotify" :participants="newParticipants"/>
      <ActivityForm v-if="showActivityForm" @closeActivityForm="closeActivityForm" @save-activity="saveActivity"
        :deadline="newEndDate" :title="newTitle" :done="newDone" :notificationOptions="notificationOptions"
        :whenNotify="newWhenNotify" :repeatNotify="newRepatNotify" />
      <UnavailabilityForm v-if="showUnavailabilityForm" @close-form="closeUnavailabilityForm"
        @save-unavailability="saveUnavailability" :title="newTitle" :all-day="newAllDay" :start-date="newStartDate"
        :end-date="newEndDate" :start-time="newStartTime" :end-time="newEndTime" :repeat="newRepeat"
        :number-of-reps="newNumberOfReps" :until="newUntil" :repeat-end-date="newRepeatEndDate" />
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