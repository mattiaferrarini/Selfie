<template>
  <div class="p-4 bg-white rounded-lg shadow border">
    <h3 v-if="weekly" class="text-lg font-semibold text-gray-800">This week</h3>
    <h3 v-else class="text-lg font-semibold text-gray-800">Today</h3>
    <div class="mt-2" v-if="showEvents">
      <h4 class="text-md font-medium text-gray-700">Events</h4>
      <div v-if="weekly">
        <ul class="list-disc pl-5">
          <li v-for="event in eventsThisWeek" :key="event.id" class="text-gray-600">{{ event.title }}</li>
        </ul>
        <p v-if="eventsThisWeek.length === 0" class="text-gray-600">No events this week.</p>
      </div>
      <div v-else>
        <ul class="list-disc pl-5">
          <li v-for="event in eventsToday" :key="event.id" class="text-gray-600">{{ event.title }}</li>
        </ul>
        <p v-if="eventsToday.length === 0" class="text-gray-600">No events today.</p>
      </div>
    </div>
    <div class="mt-2" v-if="showActivities">
      <h4 class="text-md font-medium text-gray-700">Activities</h4>
      <div v-if="weekly">
        <ul class="list-disc pl-5">
          <li v-for="event in activitiesThisWeek" :key="event.id" class="text-gray-600">{{ event.title }}</li>
          <li v-for="event in uncompletedActivitiesThisWeek" :key="event.id" class="text-red-500">{{ event.title }}</li>
        </ul>
        <p v-if="activitiesThisWeek.length === 0 && uncompletedActivitiesThisWeek.length === 0" class="text-gray-600">No
          activities this week.</p>
      </div>
      <div v-else>
        <ul class="list-disc pl-5">
          <li v-for="event in activitiesToday" :key="event.id" class="text-gray-600">{{ event.title }}</li>
          <li v-for="event in uncompletedActivitiesToday" :key="event.id" class="text-red-500">{{ event.title }}</li>
        </ul>
        <p v-if="activitiesToday.length === 0 && uncompletedActivitiesToday.length === 0" class="text-gray-600">No
          activities today.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import timeService from "@/services/timeService";
import eventService from "@/services/eventService";
import activityService from "@/services/activityService";
import eventRecurrenceService from "@/services/eventRecurrenceService";
import {CalendarEvent} from "@/models/Event";
import {Activity} from "@/models/Activity";
import {useAuthStore} from "@/stores/authStore";

export default defineComponent({
  props: {
    date: {
      type: Date,
      required: true,
    },
    weekly: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      default: 'all',
    },
  },
  data() {
    return {
      events: [] as CalendarEvent[],
      activities: [] as Activity[],
      eventsWithDates: [] as { event: CalendarEvent, dates: { start: Date, end: Date } }[],
      sortedActivities: [] as Activity[],
      startOfDay: timeService.getStartOfDay(this.date),
      endOfDay: timeService.getEndOfDay(this.date),
      endOfEndOfWeek: timeService.getEndOfDay(timeService.getLastDayOfWeek(this.date)),
    };
  },
  computed: {
    eventsToday(): CalendarEvent[] {
      return this.getEventsForPeriod(this.startOfDay, this.endOfDay);
    },
    eventsThisWeek(): CalendarEvent[] {
      return this.getEventsForPeriod(this.startOfDay, this.endOfEndOfWeek);
    },
    activitiesToday(): Activity[] {
      return this.getActivitiesForPeriod(this.startOfDay, this.endOfDay);
    },
    uncompletedActivitiesToday(): Activity[] {
      return this.getUncompletedActivitiesForPeriod(this.startOfDay);
    },
    activitiesThisWeek(): Activity[] {
      return this.getActivitiesForPeriod(this.startOfDay, this.endOfEndOfWeek);
    },
    uncompletedActivitiesThisWeek(): Activity[] {
      return this.getUncompletedActivitiesForPeriod(this.startOfDay);
    },
    showEvents(): boolean {
      return this.content === 'all' || this.content === 'events';
    },
    showActivities(): boolean {
      return this.content === 'all' || this.content === 'activities';
    },
  },
  methods: {
    async fetchData() {
      console.log("EXECUTED");
      this.startOfDay = timeService.getStartOfDay(this.date);
      this.endOfDay = timeService.getEndOfDay(this.date);
      this.endOfEndOfWeek = timeService.getEndOfDay(timeService.getLastDayOfWeek(this.date));
      const todayMidnight = timeService.getStartOfDay(this.date);
      const sundayMidnight = timeService.getEndOfDay(timeService.getLastDayOfWeek(this.date));
      const username = useAuthStore().user.username;

      this.events = await eventService.getEventsByUser(username, todayMidnight, sundayMidnight);
      this.activities = await activityService.getActivitiesByUser(username, todayMidnight, sundayMidnight);

      this.computeEventsWithDates();
      this.computeSortedActivities();
      console.log(this.uncompletedActivitiesThisWeek, this.activitiesThisWeek);
    },
    getEventsForPeriod(start: Date, end: Date): CalendarEvent[] {
      return this.eventsWithDates.filter((event: { event: CalendarEvent, dates: { start: Date, end: Date } }) => {
        return event.dates.start <= end && event.dates.end >= start;
      }).map((event: { event: CalendarEvent, dates: { start: Date, end: Date } }) => event.event);
    },
    getActivitiesForPeriod(start: Date, end: Date): Activity[] {
      return this.sortedActivities.filter((activity: Activity) => {
        return activity.deadline <= end && activity.deadline >= start;
      });
    },
    getUncompletedActivitiesForPeriod(start: Date): Activity[] {
      return this.sortedActivities.filter((activity: Activity) => {
        return activity.deadline <= start && !activity.done;
      });
    },
    computeEventsWithDates() {
      let withDates = this.events.map((event: any) => {
        return {event: event, dates: eventRecurrenceService.getNextRepetition(event, this.startOfDay)};
      });
      let inRange = withDates.filter((event: any) => {
        return event.dates.start <= this.endOfEndOfWeek && event.dates.end >= this.startOfDay;
      });
      let valid = inRange.filter((event: any) => {
        return eventRecurrenceService.isValidRepetition(event.event, event.dates.start, event.dates.end);
      });
      valid.sort((a, b) => a.dates.start.getTime() - b.dates.start.getTime());
      this.eventsWithDates = valid;
    },
    computeSortedActivities() {
      this.sortedActivities = this.activities.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
    },
  },
  async mounted() {
    await this.fetchData();
  },
  watch: {
    date: {
      handler: 'fetchData',
      immediate: true,
    }
  }
});
</script>