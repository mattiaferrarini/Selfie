<template>
  <div class="p-4 bg-white rounded-lg shadow border">
    <h3 v-if="weekly" class="text-lg font-semibold text-gray-800">This week</h3>
    <h3 v-else class="text-lg font-semibold text-gray-800">Today</h3>
    <div class="mt-2" v-if="showEvents">
      <h4 class="text-md font-medium text-gray-700">Events</h4>
      <div>
        <ul class="list-disc">
          <li v-for="event in eventsInPeriod" :key="event.id" class="text-gray-600 clickable-item"
            @click="goToCalendarEvent(event)">{{ event.title }}</li>
        </ul>
        <p v-if="eventsInPeriod.length === 0 && weekly" class="text-gray-600">No events this week.</p>
        <p v-if="eventsInPeriod.length === 0 && !weekly" class="text-gray-600">No events today.</p>
      </div>
    </div>
    <div class="mt-2" v-if="showActivities">
      <h4 class="text-md font-medium text-gray-700">Activities</h4>
      <div>
        <ul class="list-disc">
          <li v-for="activity in activitiesInPeriod" :key="activity.id" class="clickable-item"
            @click="goToCalendarActivity(activity)"
            :class="{ 'text-red-500': isLateActivity(activity), 'text-gray-600': !isLateActivity(activity) }">
            {{ activity.title }}
          </li>
        </ul>
        <p v-if="activitiesInPeriod.length === 0 && weekly" class="text-gray-600">No activities this week.</p>
        <p v-if="activitiesInPeriod.length === 0 && !weekly" class="text-gray-600">No activities today.</p>
      </div>
    </div>
    <div class="mt-2" v-if="showProjects">
      <h4 class="text-md font-medium text-gray-700">Projects</h4>
      <div>
        <ul class="list-disc">
          <li v-for="pair in projectActivitiesInPeriod" :key="pair.activity.id" class="clickable-item"
            @click="goToCalendarActivity(pair.activity)">
            <div class="flex gap-2">
              <div v-if="pair.type === 'start'" class="bg-blue-500 px-1 rounded-md text-white">Start</div>
              <div v-else class="bg-orange-500 px-1 rounded-md text-white">Deadline</div>
              <p :class="{ 'text-red-500': isLateActivity(pair.activity), 'text-gray-600': !isLateActivity(pair.activity) }">
                {{ pair.activity.title }}
              </p>
            </div>
          </li>
        </ul>
        <p v-if="projectActivitiesInPeriod.length === 0 && weekly" class="text-gray-600">No projects this week.</p>
        <p v-if="projectActivitiesInPeriod.length === 0 && !weekly" class="text-gray-600">No projects today.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import timeService from "@/services/timeService";
import eventService from "@/services/eventService";
import activityService from "@/services/activityService";
import eventRecurrenceService from "@/services/eventRecurrenceService";
import { CalendarEvent } from "@/models/Event";
import { Activity } from "@/models/Activity";
import { useAuthStore } from "@/stores/authStore";
import router from "@/router";

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
      sortedProjectActivities: [] as { activity: Activity, type: string }[],
      startOfDay: timeService.getStartOfDay(this.date),
      endOfDay: timeService.getEndOfDay(this.date),
      endOfEndOfWeek: timeService.getEndOfDay(timeService.getLastDayOfWeek(this.date)),
    };
  },
  computed: {
    eventsInPeriod(): CalendarEvent[] {
      if (this.weekly)
        return this.getEventsForPeriod(this.startOfDay, this.endOfEndOfWeek);
      else
        return this.getEventsForPeriod(this.startOfDay, this.endOfDay);
    },
    activitiesInPeriod(): Activity[] {
      if (this.weekly)
        return this.getActivitiesForPeriod(this.startOfDay, this.endOfEndOfWeek);
      else
        return this.getActivitiesForPeriod(this.startOfDay, this.endOfDay);
    },
    projectActivitiesInPeriod(): { activity: Activity, type: string }[] {
      if (this.weekly)
        return this.getProjectActivitiesForPeriod(this.startOfDay, this.endOfEndOfWeek);
      else
        return this.getProjectActivitiesForPeriod(this.startOfDay, this.endOfDay);
    },
    showEvents(): boolean {
      return this.content === 'all' || this.content === 'events';
    },
    showActivities(): boolean {
      return this.content === 'all' || this.content === 'activities';
    },
    showProjects(): boolean {
      return this.content === 'all' || this.content === 'projects';
    },
  },
  methods: {
    async fetchData() {
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
      this.computeSortedProjectActivities();
    }, 
    computeEventsWithDates() {
      let withDates = this.events.map((event: CalendarEvent) => {
        return { event: event, dates: eventRecurrenceService.getNextRepetition(event, this.startOfDay) };
      });
      let inRange = withDates.filter((event: {event: CalendarEvent, dates: {start: Date, end: Date}}) => {
        return event.dates.start <= this.endOfEndOfWeek && event.dates.end >= this.startOfDay;
      });
      let valid = inRange.filter((event: {event: CalendarEvent, dates: {start: Date, end: Date}}) => {
        return eventRecurrenceService.isValidRepetition(event.event, event.dates.start, event.dates.end);
      });
      valid.sort((a, b) => a.dates.start.getTime() - b.dates.start.getTime());
      this.eventsWithDates = valid;
    },
    computeSortedActivities() {
      const nonProjectActivities = this.activities.filter((activity: Activity) => !activity.projectId);
      this.sortedActivities = nonProjectActivities.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
    },
    computeSortedProjectActivities() {
      const projectActivities = this.activities.filter((activity: Activity) => activity.projectId);
      let startEnds = projectActivities.flatMap((activity) => {
        let start = { activity, type: 'start' };
        let deadline = { activity, type: 'deadline' };
        return [start, deadline];
      });

      let sorted = startEnds.sort((a, b) => {
        if (a.activity.start && b.activity.start) {
          return a.activity.start.getTime() - b.activity.start.getTime();
        } else if (a.activity.deadline && b.activity.deadline) {
          return a.activity.deadline.getTime() - b.activity.deadline.getTime();
        } else {
          return 0;
        }
      });
      this.sortedProjectActivities = sorted;
    },
    getEventsForPeriod(start: Date, end: Date): CalendarEvent[] {
      return this.eventsWithDates.filter((event: { event: CalendarEvent, dates: { start: Date, end: Date } }) => {
        return event.dates.start <= end && event.dates.end >= start;
      }).map((event: { event: CalendarEvent, dates: { start: Date, end: Date } }) => event.event);
    },
    getActivitiesForPeriod(start: Date, end: Date): Activity[] {
      return this.sortedActivities.filter((activity: Activity) => {
        return activity.deadline <= end;
      });
    },
    isLateActivity(activity: Activity): boolean {
      return !activity.done && activity.deadline < this.startOfDay;
    },
    getProjectActivitiesForPeriod(start: Date, end: Date): { activity: Activity, type: string }[] {
      return this.sortedProjectActivities.filter((pair: { activity: Activity, type: string }) => {
        if (pair.type === 'start' && pair.activity.start) {
          return pair.activity.start <= end && pair.activity.start >= start;
        }
        else if (pair.type === 'deadline' && pair.activity.deadline) {
          return pair.activity.deadline <= end;
        }
        else
          return false;
      });
    },
    goToCalendarEvent(event: CalendarEvent) {
      router.push({ name: "calendar", query: { eventId: event.id, view: this.weekly ? 'week' : 'day' } });
    },
    goToCalendarActivity(activity: Activity) {
      router.push({ name: "calendar", query: { activityId: activity.id, view: this.weekly ? 'week' : 'day' } });
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

<style scoped>
.clickable-item {
  cursor: pointer;
}

.clickable-item:hover {
  background-color: #f3f4f6;
}

li {
  list-style-type: none;
  margin-top: 0.25rem;
  overflow: hidden;
}
</style>