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
import router from '@/router';

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
    const currentDate = computed(() => dateStore.getCurrentDate());
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
      console.log(rangeActivities.value);
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
      await fetchActivities();
      await fetchUnavailabilities();
      await fetchResourceEvents();
      // Note: resources are not fetched, but only the events for the selected resource
    };

    /* Dynamic loading of content based on the period currentDate falls into */
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
      checkInvites();
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
      showAddOptions.value = false;
    };
    const openAddActivityForm = () => {
      selectedActivity.value = new Activity();
      showActivityForm.value = true;
      showAddOptions.value = false;
    };
    const openUnavailabilityForm = () => {
      selectedUnavailability.value = new Unavailability();
      showUnavailabilityForm.value = true;
      showAddOptions.value = false;
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
        const index = rangeEvents.value.findIndex(event => event.id === newEvent.id);
        rangeEvents.value[index] = newEvent;
      } else {
        rangeEvents.value.push(newEvent);
      }
      hideAllForms();
    };
    const deleteEvent = (event: CalendarEvent) => {
      rangeEvents.value = rangeEvents.value.filter(e => e.id !== event.id);
      hideAllForms();
    };

    /* Save new/modified activities and delete them */
    const saveActivity = async (newActivity: any) => {
      console.log(newActivity);
      fetchActivities();
      hideAllForms();
    };
    const markAsDone = async (activity: Activity) => {
      activity.done = true;
      await activityService.modifyActivity(activity);
    };
    const undoActivity = async (activity: Activity) => {
      activity.done = false;
      await activityService.modifyActivity(activity);
    };
    const deleteActivity = (activity: Activity) => {
      fetchActivities();
      hideAllForms();
    };

    /* Save new/modified unavailabilities and delete them */
    const saveUnavailability = async (newUnav: any) => {
      if (modifying.value) {
        const index = rangeUnavailabilities.value.findIndex(unav => unav.id === newUnav.id);
        rangeUnavailabilities.value[index] = newUnav;
      }
      else {
        rangeUnavailabilities.value.push(newUnav);
      }
      hideAllForms();
    };
    const deleteUnavailability = async (unavailability: Unavailability) => {
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
    const checkInvites = async () => {
      const invites = await inviteService.getPendingInvitesByUser(authStore.user.username, focusDate.value);
      hasPendingInvites.value = invites.length > 0;
    };

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
    const eventAdminOnlyModification = computed(() => {
      return content.value === 'resources';
    });

    /* Lifecycle hooks */
    onMounted(async () => {
      // Set the time range for the current period
      const [start, end] = getRangeDates();
      rangeStartDate.value = start;
      rangeEndDate.value = end;

      // Fetch the content of the view
      await Promise.all([fetchUserEvents(), fetchActivities()]);

      if(router.currentRoute.value.query.view) {
        view.value = router.currentRoute.value.query.view.toString();
      }

      if(router.currentRoute.value.query.eventId) {
        const event = rangeUserEvents.value.find(e => e.id === router.currentRoute.value.query.eventId);
        if(event) {
          modifyEvent(event);
        }
      }
      else if(router.currentRoute.value.query.activityId) {
        const activity = rangeActivities.value.find(a => a.id === router.currentRoute.value.query.activityId);
        if(activity) {
          modifyActivity(activity);
        }
      }

      console.log(rangeActivities.value);

      fetchUnavailabilities();
      fetchResources();

      // Check for pending invites
      checkInvites();
    });

    return {
      next: nextPeriod, prev: prevPeriod, resetCalendar, closeAddForms, view, content, onViewChange, showEventForm,
      showActivityForm, showUnavailabilityForm, currentDate: focusDate, saveEvent, showForm, saveActivity, rangeEvents, showAppointments,
      modifyEvent, rangeActivities, modifyActivity, markAsDone, undoActivity, rangeUnavailabilities, saveUnavailability,
      showAddOptions, openAddOptions, closeAddOptions, currentDisplayedPeriodString, modifyUnavailability,
      selectedEvent, selectedActivity, selectedUnavailability, openAddEventForm, openAddActivityForm, openUnavailabilityForm,
      modifying, deleteEvent, deleteActivity, deleteUnavailability, resource, onResourceChange, allResources, onContentChange,
      showInviteList, openInviteList, closeInviteList, noInvites, authStore, hasPendingInvites, showAddButton,
      eventAdminOnlyModification, acceptInvite
    };
  },
});
</script>

<template>
  <div class="calendar-view">
    <nav class="text-gray-700 py-4 px-2 sm:px-4">
      <div class="flex justify-between items-center h-full">
        <div class="h-full flex gap-0.5 flex-wrap">
          <select id="view" name="view" v-model="view" class="mr-0.5 px-1 py-1.5 sm:py-2 sm:px-4 h-full bg-gray-200 text-gray-600 rounded-md" @change="onViewChange">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
          <select id="content" name="content" v-model="content" class="px-1 py-1.5 sm:py-2 sm:px-4 h-full bg-gray-200 text-gray-600 rounded-md" @change="onContentChange">
            <option value="appointments">Appointments</option>
            <option value="events">Events</option>
            <option value="activities">Activities</option>
            <option value="projects">Projects</option>
            <option value="unavailabilities">Unavailabilities</option>
            <option value="resources">Resources</option>
          </select>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-end gap-0.5">
            <button @click="resetCalendar" class="bg-gray-400 rounded-full size-8 sm:size-10 flex justify-center items-center">
              <v-icon name="fa-undo" class="text-white w-full h-full p-2 sm:p-2.5"></v-icon>
            </button>
            <button @click="prev" class="bg-emerald-600 rounded-full size-8 sm:size-10 flex justify-center items-center">
              <v-icon name="md-arrowbackiosnew" class="text-white w-full h-full mr-0.5 p-1.5 sm:p-2"></v-icon>
            </button>
            <button @click="next" class="bg-emerald-600 rounded-full size-8 sm:size-10 flex justify-center items-center">
              <v-icon name="md-arrowforwardios" class="text-white w-full h-full ml-0.5 p-1.5 sm:p-2"></v-icon>
            </button>
          </div>
        </div>
      </div>
      <div v-if="content === 'resources'" class="mt-1">
        <select v-if="allResources.length > 0" id="resource" name="resource" v-model="resource"
          class="mr-2 p-2 h-full rounded bg-gray-200 text-gray-600" @change="onResourceChange">
          <option v-for="res in allResources" :key="res.id" :value="res.name">{{ res.name }}</option>
        </select>
        <p v-else>No resources available.</p>
      </div>
    </nav>

    <main class="animate-fade-in">
      <div class="w-full flex justify-center items-center">
      <VueDatePicker v-model="currentDate" :auto-apply="true" :enableTimePicker="false"
        class="cursor-pointer z-10 max-w-[250px]">
        <template #trigger>
          <div class="clickable-text flex items-center justify-center">
            <h2 class="text-2xl font-bold text-gray-700">{{ currentDisplayedPeriodString }}</h2>
            <v-icon name="bi-chevron-expand" class="h-full"></v-icon>
          </div>
        </template>
      </VueDatePicker>
    </div>

    <AppointmentsCalendar v-if="showAppointments" @modifyEvent="modifyEvent" @modifyActivity="modifyActivity"
      @undoActivity="undoActivity" @markAsDone="markAsDone" @modify-unavailability="modifyUnavailability"
      :currentDate="currentDate" :view="view" :allEvents="rangeEvents"
      :include-events="content === 'appointments' || content === 'events' || content === 'resources'"
      :includeActivities="content === 'appointments'" :allActivities="rangeActivities"
      :include-projects="content === 'appointments' || content === 'activities'"
      :all-unavailabilities="rangeUnavailabilities" :include-unavailable="content === 'unavailabilities'"/>

    <ActivitiesList v-if="content === 'activities' || content === 'projects'" @modify-activity="modifyActivity" @mark-as-done="markAsDone"
      @undo-activity="undoActivity" :activities="rangeActivities" :current-date="currentDate" :view="view"
      :include-ordinary-activities="content === 'activities'" :include-project-activities="content === 'projects'"/>
    </main>

    <div class="flex flex-col fixed bottom-4 right-4" v-click-outside="closeAddOptions">
      <ul class="mr-4 mb-4 self-start animate-appear-in-order" v-if="showAddOptions">
        <li><button class="add-button" @click.stop="openAddEventForm"><v-icon name="md-event"
              class="min-w-[25px] min-h-[25px] text-emerald-600"></v-icon>Event</button></li>
        <li><button class="add-button mt-1" @click.stop="openAddActivityForm"><v-icon name="md-eventavailable"
              class="min-w-[25px] min-h-[25px] text-emerald-600"></v-icon>Activity</button></li>
        <li><button class="add-button mt-1" @click.stop="openUnavailabilityForm"><v-icon name="md-block"
              class="min-w-[25px] min-h-[25px] text-emerald-600"></v-icon>Unavailability</button></li>
      </ul>
      <button @click.stop="openAddOptions" id="open-add-form-btn" v-if="showAddButton"
        class="bg-emerald-600 text-white p-3 rounded-full h-14 w-14 flex items-center justify-center self-end">
        <v-icon name="md-add" class="w-full h-full"></v-icon>
      </button>
    </div>

    <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      @click="closeAddForms">
      <EventForm v-if="showEventForm" @close-form="closeAddForms" @save-event="saveEvent" @delete-event="deleteEvent"
        :event="selectedEvent" :modifying="modifying" :current-date="currentDate"
        :admin-only-modification="eventAdminOnlyModification" />
      <ActivityForm v-if="showActivityForm" @close-form="closeAddForms" @save-activity="saveActivity"
        @delete-activity="deleteActivity" :activity="selectedActivity" :modifying="modifying"
        :current-date="currentDate" class="m-4" />
      <UnavailabilityForm v-if="showUnavailabilityForm" @close-form="closeAddForms"
        @delete-unavailability="deleteUnavailability" @save-unavailability="saveUnavailability"
        :unavailability="selectedUnavailability" :modifying="modifying" :current-date="currentDate"/>
    </div>

    <div v-if="showInviteList" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div v-click-outside="closeInviteList" class="bg-white p-4 m-4 rounded-lg shadow-lg relative w-full max-w-[600px]">
        <h2 class="text-lg font-bold mb-4 text-gray-800">Pending invites</h2>
        <InvitesList :username="authStore.user.username" :currentDate="currentDate" @no-invites="noInvites"
          @accept-invite="acceptInvite" />
      </div>
    </div>

    <div v-if="hasPendingInvites" class="fixed bottom-4 left-4">
      <button @click.stop="openInviteList"
        class="animate-bounce bg-emerald-600 text-white p-3 rounded-full h-14 w-14 flex items-center justify-center self-end">
        <v-icon name="md-markemailunread-outlined" class="w-full h-full"></v-icon>
      </button>
    </div>

  </div>
</template>

<style scoped>
.add-button {
  width: 100%;
  text-align: left;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding-left: 0.75rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  column-gap: 0.5rem;
  font-size: 1.125rem;
  /* 18px */
  line-height: 1.75rem;
  /* 28px */
}

.add-button:hover {
  background-color: #e5e5e5;
}
</style>

<style>
:root {
  --dp-input-icon-padding: 10px;
}

.dp__active_date,
.dp__today,
.dp__overlay_cell_active {
  --dp-primary-color: #059669;
}
</style>