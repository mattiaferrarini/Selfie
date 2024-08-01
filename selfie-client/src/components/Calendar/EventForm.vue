<template>
  <div class="bg-white p-4 rounded-lg shadow-lg w-4/5 relative" @click.stop>
    <div class="flex justify-end">
      <button @click="closeForm"> 
        <v-icon name="md-close" />
      </button>
    </div>
    <form class="flex flex-col" @submit="handleSubmit">
      <div>
        <label><input type="text" placeholder="Untitled Event" required v-model="newEvent.title" class="w-full"></label><br>
      </div>
      <hr>
      <div>
        <label><input type="checkbox" v-model="newEvent.allDay"> All-day</label><br>

        <div class="flex items-center justify-between w-full gap-4">
          <label> Start </label>
          <div class="flex gap-1">
            <input type="date" v-model="formattedStartDate">
            <input type="time" v-if="!newEvent.allDay" v-model="newStartTime">
          </div>
        </div>

        <div class="flex items-center justify-between w-full gap-4">
          <label> End </label>
          <div class="flex gap-1">
            <input type="date" v-model="formattedEndDate">
            <input type="time" v-if="!newEvent.allDay" v-model="newEndTime">
          </div>
        </div>
      </div>
      <hr>
      <div>
        <label class="flex items-center justify-between w-full gap-4">
          Repeat
          <select name="repeat" v-model="newEvent.repetition.frequency">
            <option value="never">Never</option>
            <option value="everyday">Every day</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <label v-if="repeatNewEvent" class="flex items-center justify-between w-full gap-4">
          Until
          <select name="until" v-model="newEvent.repetition.until">
            <option value="infinity">Infinity</option>
            <option value="n-reps">N repetitions</option>
            <option value="date">Date</option>
          </select>
        </label>
        <label v-if="repeatNTimes" class="flex items-center justify-between w-full gap-4">
          Number of repetitions
          <input type="number" min="0" v-model="newEvent.repetition.numberOfRepetitions"
            style="max-width: 4em; text-align: center">
        </label>
        <label v-if="repeatUntilDate" class="flex items-center justify-between w-full gap-4">
          End date
          <input type="date" v-model="formattedRepeatEndDate">
        </label>
      </div>
      <hr>
      <div>
        <label><input type="text" placeholder="Add a place" v-model="newEvent.place" class="w-full"></label><br>
        <div class="flex items-center justify-between w-full gap-4">
          Participants
          <button type="button" @click="openParticipantsForm" @click.stop>
            {{ newEvent.participants.length }}
            <v-icon name="md-navigatenext" />
          </button>
        </div>
      </div>
      <hr>
      <div>
        <div class="flex items-center justify-between w-full gap-4">
          Notification
          <div class="flex flex-wrap justify-end space-x-4">
            <label> <input type="checkbox" v-model="newNotificationOptions.os" /> OS</label>
            <label> <input type="checkbox" v-model="newNotificationOptions.email" /> Email </label>
            <label> <input type="checkbox" v-model="newNotificationOptions.whatsapp" /> Whatsapp </label>
          </div>
        </div>
        <label v-if="notifyNewEvent" class="flex items-center justify-between w-full gap-4">
          When
          <select name="whenNotify" v-model="newEvent.notification.when">
            <option value="atEvent">Time of event</option>
            <option value="5min">5 min before</option>
            <option value="30min">30 min before</option>
            <option value="1hr">1 hr before</option>
            <option value="2hr">2 hr before</option>
            <option value="1day">1 day before</option>
            <option value="2day">2 days before</option>
          </select>
        </label>
        <label v-if="notifyNewEvent" class="flex items-center justify-between w-full gap-4">
          Repeat
          <select name="repeatNotify" v-model="newEvent.notification.repeat">
            <option value="never">Never</option>
            <option value="3times">3 times</option>
            <option value="minute">Every minute</option>
            <option value="hr">Every hour</option>
            <option value="untilAnswer">Until answer</option>
          </select>
        </label>
      </div>
      <hr>
      <div class="flex-col space-y-1 w-full mt-4">
        <button v-if="modifying" type="button" class="w-full p-1 rounded-lg bg-gray-300">Export event</button>
        <button v-else type="button" class="w-full p-1 rounded-lg bg-gray-300">Import event</button>
      <div class="flex w-full space-x-1">
        <button v-if="modifying" type="button" @click="deleteEvent" class="flex-1 bg-red-600 text-white p-1 rounded-lg">Delete</button>
        <button type="submit" class="flex-1 bg-emerald-600 text-white p-1 rounded-lg">Save</button>
      </div>
    </div>
    </form>

    <ParticipantsForm v-if="showParticipantsForm" :participants="newEvent.participants"
      @closeParticipantsForm="handleCloseParticipantsForm" />

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ParticipantsForm from './ParticipantsForm.vue';
import { CalendarEvent } from '@/models/Event';

export default defineComponent({
  components: {
    ParticipantsForm
  },
  props: {
    event: {
      type: Object as () => CalendarEvent,
      required: true
    },
    modifying: {
      type: Boolean,
      default: false
    }
  },
  emits: ['closeForm', 'saveEvent', 'deleteEvent'],
  data() {
    return {
      newEvent: { ...this.event },
      newStartTime: `${String(this.event.start.getHours()).padStart(2, '0')}:${String(this.event.start.getMinutes()).padStart(2, '0')}`,
      newEndTime: `${String(this.event.end.getHours()).padStart(2, '0')}:${String(this.event.end.getMinutes()).padStart(2, '0')}`,
      newNotificationOptions: {
        os: this.event.notification.method.includes('os'),
        email: this.event.notification.method.includes('email'),
        whatsapp: this.event.notification.method.includes('whatsapp')
      },
      showParticipantsForm: false
    }
  },
  methods: {
    closeForm() {
      this.$emit('closeForm');
    },
    handleSubmit(event: Event) {
      event.preventDefault();

      this.newEvent.notification.method = [];
      if (this.newNotificationOptions.os)
        this.newEvent.notification.method.push('os');
      if (this.newNotificationOptions.email)
        this.newEvent.notification.method.push('email');
      if (this.newNotificationOptions.whatsapp)
        this.newEvent.notification.method.push('whatsapp');

      this.$emit('saveEvent', this.newEvent);
    },
    openParticipantsForm() {
      this.showParticipantsForm = true;
    },
    closeParticipantsForm() {
      this.showParticipantsForm = false;
    },
    handleCloseParticipantsForm(participants: any) {
      this.newEvent.participants = participants;
      this.closeParticipantsForm();
    },
    deleteEvent() {
      this.$emit('deleteEvent', this.event);
    }
  },
  computed: {
    repeatNewEvent() {
      return this.newEvent.repetition.frequency !== 'never';
    },
    repeatNTimes() {
      return this.newEvent.repetition.until === 'n-reps';
    },
    repeatUntilDate() {
      return this.newEvent.repetition.until === 'date';
    },
    notifyNewEvent() {
      return this.newNotificationOptions.os || this.newNotificationOptions.email || this.newNotificationOptions.whatsapp;
    },
    formattedStartDate: {
      get() {
        return this.newEvent.start.toISOString().split('T')[0];
      },
      set(value: string) {
        this.newEvent.start = new Date(value);
      }
    },
    formattedEndDate: {
      get() {
        return this.newEvent.end.toISOString().split('T')[0];
      },
      set(value: string) {
        this.newEvent.end = new Date(value);
      }
    },
    formattedRepeatEndDate: {
      get() {
        return this.newEvent.repetition.endDate.toISOString().split('T')[0];
      },
      set(value: string) {
        this.newEvent.repetition.endDate = new Date(value);
      }
    }
  }
});
</script>

<style scoped>
/* Your component's styles go here */
</style>