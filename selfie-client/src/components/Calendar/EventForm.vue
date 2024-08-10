<template>
  <div class="relative" @click.stop>
    <div class="flex justify-end">
      <button @click="closeForm">
        <v-icon name="md-close" />
      </button>
    </div>
    <form class="flex flex-col" @submit="handleSubmit">
      <div>
        <label><input type="text" placeholder="Untitled Event" required v-model="newEvent.title"
            class="w-full"></label><br>
      </div>
      <hr>
      <div>
        <label><input type="checkbox" v-model="newEvent.allDay"> All-day</label><br>

        <div class="flex items-center justify-between w-full gap-4">
          <label> Start </label>
          <div class="flex gap-1" style="height: 20px;">
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
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
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
        <label><input type="text" placeholder="Add a place" v-model="newEvent.location" class="w-full"></label><br>
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
        <button v-if="modifying" type="button" @click="openExportPanel" class="w-full p-1 rounded-lg bg-gray-300">Export
          event</button>
        <div v-else class="text-center">
          <label id="event-upload" for="fileInput" class="w-full p-1 rounded-lg bg-gray-300 block">Import event</label>
          <input class="hidden" type="file" id="fileInput" accept=".ics" @change="handleEventUpload">
        </div>
        <div class="flex w-full space-x-1">
          <button v-if="modifying" type="button" @click="deleteEvent"
            class="flex-1 bg-red-600 text-white p-1 rounded-lg">Delete</button>
          <button type="submit" class="flex-1 bg-emerald-600 text-white p-1 rounded-lg">Save</button>
        </div>
      </div>
    </form>

    <ParticipantsForm v-if="showParticipantsForm" :participants="newEvent.participants" :event="newEvent"
      @closeParticipantsForm="handleCloseParticipantsForm" />

    <EventExportPanel v-if="showExportPanel" :event="newEvent" @closePanel="closeExportPanel" />

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ParticipantsForm from './ParticipantsForm.vue';
import EventExportPanel from './EventExportPanel.vue';
import { CalendarEvent } from '@/models/Event';
import timeService from '@/services/timeService';
import { useAuthStore } from '@/stores/authStore';
import eventService from '@/services/eventService';

export default defineComponent({
  components: {
    ParticipantsForm,
    EventExportPanel
  },
  props: {
    event: {
      type: Object as () => CalendarEvent,
      required: true
    },
    modifying: {
      type: Boolean,
      default: false
    },
    currentDate: {
      type: Date,
      required: true
    }
  },
  emits: ['closeForm', 'saveEvent', 'deleteEvent'],
  data() {
    return {
      newEvent: { ...this.event },
      newStartTime: "",
      newEndTime: "",
      newNotificationOptions: {
        os: this.event.notification.method.includes('os'),
        email: this.event.notification.method.includes('email'),
        whatsapp: this.event.notification.method.includes('whatsapp')
      },
      showParticipantsForm: false,
      authStore: useAuthStore(),
      showExportPanel: false
    }
  },
  mounted() {
    this.onFormVisible();
  },
  methods: {
    onFormVisible() {
      if (!this.modifying) {
        // intialize default values for new event
        this.newEvent.start = timeService.roundTime(this.currentDate);
        this.newEvent.end = timeService.moveAheadByHours(this.newEvent.start, 1);
        this.newEvent.repetition.endDate = new Date(this.newEvent.end);
        this.newEvent.participants = [
          { username: this.authStore.user.username, email: this.authStore.user.email, status: 'accepted' },
        ];
      }

      this.setTimes();
    },
    setTimes(){
      this.newStartTime = `${String(this.newEvent.start.getHours()).padStart(2, '0')}:${String(this.newEvent.start.getMinutes()).padStart(2, '0')}`;
      this.newEndTime = `${String(this.newEvent.end.getHours()).padStart(2, '0')}:${String(this.newEvent.end.getMinutes()).padStart(2, '0')}`;
    },
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

      if (this.newEvent.allDay) {
        this.newEvent.start.setHours(0, 0);
        this.newEvent.end.setHours(23, 59, 59);
      }
      else {
        this.newEvent.start.setHours(Number(this.newStartTime.split(':')[0]), Number(this.newStartTime.split(':')[1]));
        this.newEvent.end.setHours(Number(this.newEndTime.split(':')[0]), Number(this.newEndTime.split(':')[1]));
      }

      this.$emit('saveEvent', this.newEvent);
    },
    openParticipantsForm() {
      this.showParticipantsForm = true;
    },
    closeParticipantsForm() {
      this.showParticipantsForm = false;
    },
    handleCloseParticipantsForm(participants: any[]) {
      this.newEvent.participants = participants;
      this.closeParticipantsForm();
    },
    deleteEvent() {
      this.$emit('deleteEvent', this.event);
    },
    openExportPanel() {
      this.showExportPanel = true;
    },
    closeExportPanel() {
      this.showExportPanel = false;
    },
    handleEventUpload(event: Event) {
      const file = (event.target as HTMLInputElement)?.files?.[0] || null;

      if (file && file.type === 'text/calendar') {
        const reader = new FileReader();

        reader.onload = (e) => {
          const fileContent = e.target?.result;
          this.setUploadedFile(fileContent as string);
        };
        reader.readAsText(file);
      } else {
        alert('Please upload a valid .ics file.');
      }
    },
    async setUploadedFile(fileContent: string) {
      this.newEvent = await eventService.convertICalendarToEvent(fileContent);
      this.setTimes();
    }
  },
  computed: {
    repeatNewEvent(): boolean {
      return this.newEvent.repetition.frequency !== 'never';
    },
    repeatNTimes(): boolean {
      return this.newEvent.repetition.until === 'n-reps';
    },
    repeatUntilDate(): boolean {
      return this.newEvent.repetition.until === 'date';
    },
    notifyNewEvent(): boolean {
      return this.newNotificationOptions.os || this.newNotificationOptions.email || this.newNotificationOptions.whatsapp;
    },
    formattedStartDate: {
      get(): string {
        return this.newEvent.start.toISOString().split('T')[0];
      },
      set(value: string) {
        this.newEvent.start = new Date(value);
      }
    },
    formattedEndDate: {
      get(): string {
        return this.newEvent.end.toISOString().split('T')[0];
      },
      set(value: string) {
        this.newEvent.end = new Date(value);
      }
    },
    formattedRepeatEndDate: {
      get(): string {
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
#event-upload {
  cursor: pointer;
}
</style>