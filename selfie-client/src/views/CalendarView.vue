<script lang="ts">
import { ref, computed, defineComponent, onMounted, watch } from 'vue';
import EventForm from "@/components/Calendar/EventForm.vue";
import ActivitiesList from "@/components/Calendar/ActivitiesList.vue";
import AppointmentsCalendar from "@/components/Calendar/AppointmentsCalendar.vue";
import ActivityForm from "@/components/Calendar/ActivityForm.vue";
import UnavailabilityForm from '@/components/Calendar/UnavailabilityForm.vue';
import InvitesList from '@/components/Calendar/InvitesList.vue';
import timeMethods from '@/services/timeService';
import { CalendarEvent } from '@/models/Event';
import { Activity } from '@/models/Activity';
import { Unavailability } from '@/models/Unavailability';
import { useAuthStore } from '@/stores/authStore';
import eventService from '@/services/eventService';
import activityService from '@/services/activityService';
import unavailabilityService from '@/services/unavailabilityService';
import resourceService from '@/services/resourceService';
import { useDateStore } from '@/stores/dateStore';
import { Resource } from '@/models/Resource';
import inviteService from '@/services/inviteService';

export default defineComponent({
  name: 'CalendarView',
  components: {
    EventForm,
    AppointmentsCalendar,
    ActivitiesList,
    ActivityForm,
    UnavailabilityForm,
    InvitesList
  },
  setup() {
    /* store instances */
    const authStore = useAuthStore();
    const dateStore = useDateStore();

    /* to handle the time period for which events are loaded */
    const currentDate = computed(() => dateStore.currentDate);
    const focusDate = ref(new Date(dateStore.getCurrentDate()));
    const rangeStartDate = ref(new Date());
    const rangeEndDate = ref(new Date());

    /* content of the view */
    const rangeEvents = ref<CalendarEvent[]>([]);
    const rangeUserEvents = ref<CalendarEvent[]>([]);
    const rangeActivities = ref<Activity[]>([]);
    const rangeUnavailabilities = ref<Unavailability[]>([]);
    const allResources = ref<Resource[]>([]);

    /* selected content */
    const selectedEvent = ref<CalendarEvent>(new CalendarEvent());
    const selectedActivity = ref<Activity>(new Activity());
    const selectedUnavailability = ref<Unavailability>(new Unavailability());

    /* variables to control what is displayed */
    const view = ref('day');
    const content = ref('appointments');
    const showAddOptions = ref(false);
    const showEventForm = ref(false);
    const showActivityForm = ref(false);
    const showUnavailabilityForm = ref(false);
    const showInviteList = ref(false);
    const hasPendingInvites = ref(false);
    const modifying = ref(false);
    const resource = ref('');

    /* Fetch content of the view */
    const fetchUserEvents = async () => {
      rangeUserEvents.value = await eventService.getEventsByUser(authStore.user.username, rangeStartDate.value, rangeEndDate.value);
      if (content.value === 'appointments' || content.value === 'events')
        rangeEvents.value = rangeUserEvents.value;
    };
    const fetchActivities = async () => {
      rangeActivities.value = await activityService.getActivitiesByUser(authStore.user.username, rangeStartDate.value, rangeEndDate.value);
    };
    const fetchUnavailabilities = async () => {
      rangeUnavailabilities.value = await unavailabilityService.getUnavailabilitiesByUser(authStore.user.username, rangeStartDate.value, rangeEndDate.value);
    };
    const fetchResources = async () => {
      allResources.value = await resourceService.getAllResources();
      if (allResources.value.length > 0)
        resource.value = allResources.value[0].name;
    };
    const fetchResourceEvents = async () => {
      return await eventService.getEventsByUser(resource.value, rangeStartDate.value, rangeEndDate.value);
    };
    const reFetchCalendarContent = async () => {
      await fetchUserEvents();
      fetchActivities();
      fetchUnavailabilities();
      fetchResourceEvents();
      // Note: resources are not fetched, but only the events for the selected resource
    };

    /* Dynamic loading of content based of the period currentDate falls into */
    const getRangeDates = () => {
      const firstDayOfMonth = timeMethods.getFirstDayOfMonth(focusDate.value);
      const lastDayOfMonth = timeMethods.getLastDayOfMonth(focusDate.value);

      const firstDayOfWeek = timeMethods.getFirstDayOfWeek(firstDayOfMonth);
      const lastDayOfWeek = timeMethods.getLastDayOfWeek(lastDayOfMonth);

      return [timeMethods.getStartOfDay(firstDayOfWeek), timeMethods.getEndOfDay(lastDayOfWeek)];
    };
    const updateRangeAndFetchCalendarIfNecessary = async () => {
      const [start, end] = getRangeDates();

      if (start.getTime() !== rangeStartDate.value.getTime() || end.getTime() !== rangeEndDate.value.getTime()) {
        rangeStartDate.value = start;
        rangeEndDate.value = end;
        await reFetchCalendarContent();
      }
    };
    watch(focusDate, async () => {
      console.log('Focus date changed');
      await updateRangeAndFetchCalendarIfNecessary();
    });
    watch(currentDate, async () => {
      console.log('Current date changed');
      focusDate.value = new Date(currentDate.value);
    });

    /* Navigation and date handling */
    const nextPeriod = () => {
      focusDate.value = timeMethods.nextCurrentDate(focusDate.value, view.value);
    };
    const prevPeriod = () => {
      focusDate.value = timeMethods.prevCurrentDate(focusDate.value, view.value);
    };
    const resetCalendar = () => {
      focusDate.value = new Date();
      document.getElementById(focusDate.value.toISOString().substring(0, 10))?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };
    const onViewChange = () => {
      console.log(`View changed to: ${view.value}`);
    };
    const onContentChange = async () => {
      if (content.value === 'resources' && allResources.value.length > 0)
        rangeEvents.value = await fetchResourceEvents();
      else
        rangeEvents.value = rangeUserEvents.value;
    };
    const onResourceChange = async () => {
      rangeEvents.value = await fetchResourceEvents();
    };

    /* Open forms to add events, activities, and unavailabilities */
    const openAddOptions = () => {
      showAddOptions.value = true;
    };
    const closeAddOptions = () => {
      showAddOptions.value = false;
    };

    const openAddEventForm = () => {
      selectedEvent.value = new CalendarEvent();
      showEventForm.value = true;
    };
    const openAddActivityForm = () => {
      selectedActivity.value = new Activity();
      showActivityForm.value = true;
    };
    const openUnavailabilityForm = () => {
      selectedUnavailability.value = new Unavailability();
      showUnavailabilityForm.value = true;
    };

    /* Open forms to modify events, activities, and unavailabilities */
    const modifyEvent = (event: CalendarEvent) => {
      selectedEvent.value = event;
      modifying.value = true;
      showEventForm.value = true;
    };
    const modifyActivity = (activity: Activity) => {
      selectedActivity.value = activity;
      modifying.value = true;
      showActivityForm.value = true;
    };
    const modifyUnavailability = (unavailability: Unavailability) => {
      selectedUnavailability.value = unavailability;
      modifying.value = true;
      showUnavailabilityForm.value = true;
    };

    /* Close forms */
    const closeAddForms = () => {
      hideAllForms();
    };
    const hideAllForms = () => {
      showEventForm.value = false;
      showActivityForm.value = false;
      showUnavailabilityForm.value = false;

      showAddOptions.value = false;
      modifying.value = false;
    };

    /* Save new/modified events and delete them */
    const saveEvent = async (newEvent: CalendarEvent) => {
      if (modifying.value) {
        const res = await eventService.modifyEvent(newEvent);
        const index = rangeEvents.value.findIndex(event => event.id === res.id);
        rangeEvents.value[index] = res;
      } else {
        const res = await eventService.addEvent(newEvent);
        rangeEvents.value.push(res);
      }

      hideAllForms();
    };
    const deleteEvent = (event: CalendarEvent) => {
      eventService.deleteEvent(event);
      rangeEvents.value = rangeEvents.value.filter(e => e.id !== event.id);
      hideAllForms();
    };

    /* Save new/modified activities and delete them */
    const saveActivity = async (newActivity: any) => {
      if (modifying.value) {
        const index = rangeActivities.value.findIndex(activity => activity.id === newActivity.id);
        rangeActivities.value[index] = newActivity;
      } else {
        rangeActivities.value.push(newActivity);
      }
      hideAllForms();
    };
    const markAsDone = async (activity: Activity) => {
      activity.done = true;
      const res = await activityService.modifyActivity(activity);
    };
    const undoActivity = async (activity: Activity) => {
      activity.done = false;
      const res = await activityService.modifyActivity(activity);
    };
    const deleteActivity = (activity: Activity) => {
      activityService.deleteActivity(activity);
      rangeActivities.value = rangeActivities.value.filter(a => a.id !== activity.id);
      hideAllForms();
    };

    /* Save new/modified unavailabilities and delete them */
    const saveUnavailability = async (newUnav: any) => {
      if (modifying.value) {
        const res = await unavailabilityService.modifyUnavailability(newUnav);
        const index = rangeUnavailabilities.value.findIndex(unav => unav.id === newUnav.id);
        rangeUnavailabilities.value[index] = res;
      }
      else {
        const res = await unavailabilityService.addUnavailability(newUnav);
        rangeUnavailabilities.value.push(res);
      }

      hideAllForms();
    };
    const deleteUnavailability = async (unavailability: Unavailability) => {
      unavailabilityService.deleteUnavailability(unavailability);
      rangeUnavailabilities.value = rangeUnavailabilities.value.filter(u => u.id !== unavailability.id);
      hideAllForms();
    };

    /* Manage the invite list */
    const openInviteList = () => {
      showInviteList.value = true;
    };
    const closeInviteList = () => {
      showInviteList.value = false;
    };
    const noInvites = () => {
      hasPendingInvites.value = false;
      showInviteList.value = false;
    }
    const acceptInvite = async (invite: any) => {
      if (invite.eventId) {
        const event = await eventService.getEventById(invite.eventId);
        if (event)
          rangeUserEvents.value.push(event);
      }
      else if (invite.activityId) {
        const activity = await activityService.getActivityById(invite.activityId);
        if (activity)
          rangeActivities.value.push(activity);
      }
    }

    /* Computed properties */
    const showForm = computed(() => {
      return showEventForm.value || showActivityForm.value || showUnavailabilityForm.value;
    });
    const showAppointments = computed(() => {
      return content.value === 'appointments' || content.value === 'events' || content.value === 'unavailabilities' || content.value === 'resources';
    });
    const currentDisplayedPeriodString = computed(() => {
      return timeMethods.formatPeriodString(focusDate.value, view.value);
    });
    const showAddButton = computed(() => {
      return content.value !== 'resources' || authStore.isAdmin;
    });
    const eventModificationAllowd = computed(() => {
      return content.value !== 'resources' || authStore.isAdmin;
    });

    /* Lifecycle hooks */
    onMounted(async () => {
      // Set the time range for the current period
      const [start, end] = getRangeDates();
      rangeStartDate.value = start;
      rangeEndDate.value = end;

      // Fetch the content of the view
      fetchUserEvents();
      fetchActivities();
      fetchUnavailabilities();
      fetchResources();
      // Note: events for resource are fetched when the resource is changed

      // TODO: change
      hasPendingInvites.value = (await inviteService.getPendingInvitesByUser(authStore.user.username, focusDate.value)).length > 0;
    });

    return {
      next: nextPeriod, prev: prevPeriod, resetCalendar, closeAddForms, view, content, onViewChange, showEventForm,
      showActivityForm, showUnavailabilityForm, currentDate: focusDate, saveEvent, showForm, saveActivity, rangeEvents, showAppointments,
      modifyEvent, rangeActivities, modifyActivity, markAsDone, undoActivity, rangeUnavailabilities, saveUnavailability,
      showAddOptions, openAddOptions, closeAddOptions, currentDisplayedPeriodString, modifyUnavailability,
      selectedEvent, selectedActivity, selectedUnavailability, openAddEventForm, openAddActivityForm, openUnavailabilityForm,
      modifying, deleteEvent, deleteActivity, deleteUnavailability, resource, onResourceChange, allResources, onContentChange,
      showInviteList, openInviteList, closeInviteList, noInvites, authStore, hasPendingInvites, showAddButton, eventModificationAllowd, acceptInvite
    };
  },
});
</script>

<template>
  <div class="calendar-view animate-fade-in">
    <nav class="text-gray-700 p-4 sm:p-8">
      <div class="flex justify-between mb-2">
        <div>
          <select id="view" name="view" v-model="view" class="mr-2 p-1 h-full rounded" @change="onViewChange">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
          <select id="content" name="content" v-model="content" class="p-1 h-full rounded" @change="onContentChange">
            <option value="appointments">Appointments</option>
            <option value="events">Events</option>
            <option value="activities">Activities</option>
            <option value="unavailabilities">Unavailabilities</option>
            <option value="resources">Resources</option>
          </select>
        </div>
        <div class="flex items-center button-group">
          <button @click="resetCalendar" class="p-1"><v-icon name="fa-undo"></v-icon></button>
          <div class="flex items-center">
            <button @click="prev" class="p-1"><v-icon name="md-navigatebefore"></v-icon></button>
            <button @click="next" class="p-1"><v-icon name="md-navigatenext"></v-icon></button>
          </div>
        </div>
      </div>
      <div v-if="content === 'resources'">
        <select v-if="allResources.length > 0" id="resource" name="resource" v-model="resource"
          class="mr-2 p-2 h-full rounded" @change="onResourceChange">
          <option v-for="res in allResources" :key="res.id" :value="res.name">{{ res.name }}</option>
        </select>
        <p v-else>No resources available.</p>
      </div>
    </nav>

    <VueDatePicker v-model="currentDate" :auto-apply="true" :enableTimePicker="false" class="cursor-pointer z-0">
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
      :include-events="content === 'appointments' || content === 'events' || content === 'resources'"
      :includeActivities="content === 'appointments'" :allActivities="rangeActivities"
      :all-unavailabilities="rangeUnavailabilities" :include-unavailable="content === 'unavailabilities'" />

    <ActivitiesList v-if="content === 'activities'" @modify-activity="modifyActivity" @mark-as-done="markAsDone"
      @undo-activity="undoActivity" :activities="rangeActivities" :current-date="currentDate" :view="view" />

    <div class="flex flex-col fixed bottom-4 right-4" v-click-outside="closeAddOptions">
      <ul class="mr-4 mb-4 self-start" v-if="showAddOptions">
        <li><button class="add-button" @click.stop="openAddEventForm">Event</button></li>
        <li><button class="add-button" @click.stop="openAddActivityForm">Activity</button></li>
        <li><button class="add-button" @click.stop="openUnavailabilityForm">Unavailability</button></li>
      </ul>
      <button @click.stop="openAddOptions" id="open-add-form-btn" v-if="showAddButton"
        class="bg-emerald-600 text-white p-3 rounded-full h-14 w-14 flex items-center justify-center self-end">
        <v-icon name="md-add" class="w-full h-full"></v-icon>
      </button>
    </div>

    <div v-if="hasPendingInvites" class="fixed bottom-4 left-4">
      <button @click.stop="openInviteList"
        class="animate-bounce bg-emerald-600 text-white p-3 rounded-full h-14 w-14 flex items-center justify-center self-end">
        <v-icon name="md-markemailunread-outlined" class="w-full h-full"></v-icon>
      </button>
    </div>

    <div v-if="showForm" class="fixed inset-0 flex justify-center items-center bg-emerald-600 z-50"
      @click="closeAddForms">
      <EventForm v-if="showEventForm" @close-form="closeAddForms" @save-event="saveEvent" @delete-event="deleteEvent"
        :event="selectedEvent" :modifying="modifying" :current-date="currentDate"
        :modification-allowed="eventModificationAllowd" class="m-4" />
      <ActivityForm v-if="showActivityForm" @close-form="closeAddForms" @save-activity="saveActivity"
        @delete-activity="deleteActivity" :activity="selectedActivity" :modifying="modifying"
        :current-date="currentDate" class="m-4" />
      <UnavailabilityForm v-if="showUnavailabilityForm" @close-form="closeAddForms"
        @delete-unavailability="deleteUnavailability" @save-unavailability="saveUnavailability"
        :unavailability="selectedUnavailability" :modifying="modifying" :current-date="currentDate" class="m-4" />
    </div>

    <div v-if="showInviteList" class="fixed inset-0 flex justify-center items-center bg-emerald-600 z-50">
      <div v-click-outside="closeInviteList" class="bg-white m-4 p-4 rounded-lg shadow-lg w-full">
        <h2 class="text-lg font-bold mb-4">Pending invites</h2>
        <InvitesList :username="authStore.user.username" :currentDate="currentDate" @no-invites="noInvites" @accept-invite="acceptInvite"/>
      </div>
    </div>

  </div>
</template>

<style scoped>
.button-group button {
  border: 1px solid #ccc;
  border-radius: 5px;
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

<style>
:root {
  --dp-input-icon-padding: 10px;
}

.dp__active_date,
.dp__today,
.dp__overlay_cell_active {
  --dp-primary-color: #10b981;
}
</style>