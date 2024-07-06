<template>
  <div class="p-4 bg-white rounded-lg shadow border m-4">
    <h3 class="text-lg font-semibold text-gray-800">Events</h3>
    <div v-if="weekly">
      <h4 class="text-md font-medium text-gray-700">This Week</h4>
      <ul class="list-disc pl-5">
        <li v-for="event in eventsThisWeek" :key="event.id" class="text-gray-600">{{ event.name }}</li>
      </ul>
    </div>
    <div v-else>
      <h4 class="text-md font-medium text-gray-700">Today</h4>
      <ul class="list-disc pl-5">
        <li v-for="event in eventsToday" :key="event.id" class="text-gray-600">{{ event.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    date: {
      type: Date,
      required: true,
    },
    weekly: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      // Example events, replace with your actual events source
      events: [
        { id: 1, name: "Event 1", date: new Date() }, // Today
        { id: 2, name: "Event 2", date: new Date(new Date().setDate(new Date().getDate() + 1)) }, // Tomorrow
        { id: 3, name: "Event 3", date: new Date(new Date().setDate(new Date().getDate() + 7)) }, // Next Week
        // Add more events for testing
      ],
    };
  },
  computed: {
    eventsToday() {
      return this.events.filter((event) => this.isSameDay(event.date, this.date));
    },
    eventsThisWeek() {
      console.log(this.events.filter((event) => this.isSameWeek(event.date, this.date)))
      return this.events.filter((event) => this.isSameWeek(event.date, this.date));
    },
  },
  methods: {
    isSameDay(date1: Date, date2: Date) {
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear();
    },
    isSameWeek(date1: Date, date2: Date) {
      const getStartOfWeek = (date: Date) => {
        const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(date.getFullYear(), date.getMonth(), diff);
      };
      const start1 = getStartOfWeek(new Date(date1));
      const start2 = getStartOfWeek(new Date(date2));
      console.log(start1, start2);
      return start1.toDateString() == start2.toDateString();
    },
  },
});
</script>