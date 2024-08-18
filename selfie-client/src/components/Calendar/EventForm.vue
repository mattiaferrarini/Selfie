<template>
  <div class="bg-white p-4 rounded-lg shadow-lg relative" @click.stop>
    <div class="flex justify-end">
      <button @click="closeForm">
        <v-icon name="md-close" />
      </button>
    </div>
    <form class="flex flex-col" @submit="handleSubmit">
      <div>
        <label><input type="text" placeholder="Untitled Event" required v-model="newEvent.title" class="w-full"
            :disabled="!modificationAllowed"></label>
      </div>
      <hr>
      <div>
        <label><input type="checkbox" v-model="newEvent.allDay" :disabled="!modificationAllowed"> All-day</label><br>

        <div class="flex items-center justify-between w-full gap-4">
          <label> Start </label>
          <div class="flex gap-1">
            <input type="date" v-model="formattedStartDate" :disabled="!modificationAllowed">
            <input type="time" v-if="!newEvent.allDay" v-model="newStartTime" :disabled="!modificationAllowed">
          </div>
        </div>

        <div class="flex items-center justify-between w-full gap-4">
          <label> End </label>
          <div class="flex gap-1">
            <input type="date" v-model="formattedEndDate" :disabled="!modificationAllowed" :min="minEndDate">
            <input type="time" v-if="!newEvent.allDay" v-model="newEndTime" :disabled="!modificationAllowed"
              :min="minEndTime">
          </div>
        </div>
      </div>
      <hr>
      <div>
        <label class="flex items-center justify-between w-full gap-4">
          Repeat
          <select name="repeat" v-model="newEvent.repetition.frequency" :disabled="!modificationAllowed">
            <option value="never">Never</option>
            <option v-if="dailyRepetitionAllowed" value="daily">Daily</option>
            <option v-if="weeklyRepetitionAllowed" value="weekly">Weekly</option>
            <option v-if="monthlyRepetitionAllowed" value="monthly">Monthly</option>
            <option v-if="yearlyRepetitionAllowed" value="yearly">Yearly</option>
          </select>
        </label>
        <label v-if="repeatNewEvent" class="flex items-center justify-between w-full gap-4">
          Until
          <select name="until" v-model="newEvent.repetition.until" :disabled="!modificationAllowed">
            <option value="infinity">Infinity</option>
            <option value="n-reps">N repetitions</option>
            <option value="date">Date</option>
          </select>
        </label>
        <label v-if="repeatNTimes" class="flex items-center justify-between w-full gap-4">
          Number of repetitions
          <input type="number" min="1" v-model="newEvent.repetition.numberOfRepetitions"
            style="max-width: 4em; text-align: center" :disabled="!modificationAllowed">
        </label>
        <label v-if="repeatUntilDate" class="flex items-center justify-between w-full gap-4">
          End date
          <input type="date" v-model="formattedRepeatEndDate" :disabled="!modificationAllowed" :min="minRepEndDate">
        </label>
      </div>
      <hr>
      <div>
        <label><input type="text" placeholder="Add a place" v-model="newEvent.location" class="w-full"
            :disabled="!modificationAllowed"></label><br>
      </div>
      <hr>
      <div>
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
            <label> <input type="checkbox" v-model="newNotificationOptions.os" :disabled="!modificationAllowed" />
              OS</label>
            <label> <input type="checkbox" v-model="newNotificationOptions.email" :disabled="!modificationAllowed" />
              Email </label>
            <label> <input type="checkbox" v-model="newNotificationOptions.whatsapp" :disabled="!modificationAllowed" />
              Whatsapp </label>
          </div>
        </div>
        <label v-if="notifyNewEvent" class="flex items-center justify-between w-full gap-4">
          When
          <select name="whenNotify" v-model="newEvent.notification.when" :disabled="!modificationAllowed"
            @change="enforceRepetitionCoherence">
            <option value="atEvent">Time of event</option>
            <option value="5 minutes">5 min before</option>
            <option value="15 minutes">15 min before</option>
            <option value="30 minutes">30 min before</option>
            <option value="1 hour">1 hr before</option>
            <option value="2 hours">2 hr before</option>
            <option value="1 day">1 day before</option>
            <option value="2 days">2 days before</option>
            <option value="1 week">1 week before</option>
          </select>
        </label>
        <label v-if="repeatedNotificationAllowed" class="flex items-center justify-between w-full gap-4">
          Repeat
          <select name="repeatNotify" v-model="newEvent.notification.repeat" :disabled="!modificationAllowed">
            <option value="never">Never</option>
            <option v-if="repetitionOptionAllowed('1 minute')" value="minute">Every minute</option>
            <option v-if="repetitionOptionAllowed('5 minutes')" value="5 minutes">Every 5 minutes</option>
            <option v-if="repetitionOptionAllowed('15 minutes')" value="15 minutes">Every 15 minutes</option>
            <option v-if="repetitionOptionAllowed('30 minutes')" value="30 minutes">Every 30 minutes</option>
            <option v-if="repetitionOptionAllowed('1 hour')" value="1 hour">Every hour</option>
            <option v-if="repetitionOptionAllowed('2 hours')" value="2 hours">Every 2 hours</option>
            <option v-if="repetitionOptionAllowed('1 day')" value="1 day">Every day</option>
          </select>
        </label>
      </div>
      <hr>
      <div v-if="modificationAllowed" class="flex-col space-y-1 w-full mt-4">
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
      <div v-else class="mt-4">
        <p class="text-center text-red-600">You cannot modify this event.</p>
      </div>
    </form>

    <ParticipantsForm v-if="showParticipantsForm" :participants="newEvent.participants" :event="newEvent"
      @closeParticipantsForm="handleCloseParticipantsForm" :modification-allowed="modificationAllowed" />

    <EventExportPanel v-if="showExportPanel" :event="newEvent" @closePanel="closeExportPanel" />

    <ConfirmationPanel v-if="confirmationMessage.length > 0" :message="confirmationMessage" @cancel="cancelAction"
      @confirm="confirmAction" />

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
import ConfirmationPanel from './ConfirmationPanel.vue';

export default defineComponent({
  components: {
    ParticipantsForm,
    EventExportPanel,
    ConfirmationPanel
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
    },
    modificationAllowed: {
      type: Boolean,
      default: true
    }
  },
  emits: ['closeForm', 'saveEvent', 'deleteEvent'],
  data() {
    return {
      newEvent: { ...this.event },
      newNotificationOptions: {
        os: this.event.notification.method.includes('os'),
        email: this.event.notification.method.includes('email'),
        whatsapp: this.event.notification.method.includes('whatsapp')
      },
      newStartTime: '',
      newEndTime: '',
      showParticipantsForm: false,
      authStore: useAuthStore(),
      showExportPanel: false,
      confirmationMessage: ''
    }
  },
  mounted() {
    this.onFormVisible();
  },
  methods: {
    onFormVisible() {
      if (!this.modifying) {
        // intialize default values for new event
        console.log(this.currentDate);
        this.newEvent.start = timeService.roundTime(this.currentDate);
        this.newEvent.end = timeService.moveAheadByHours(this.newEvent.start, 1);
        this.newEvent.repetition.endDate = new Date(this.newEvent.end);
        this.newEvent.participants = [
          { username: this.authStore.user.username, email: this.authStore.user.email, status: 'accepted' },
        ];
      }
      this.setTimes();
    },
    setTimes() {
      this.newStartTime = timeService.formatTime(this.newEvent.start);
      this.newEndTime = timeService.formatTime(this.newEvent.end);
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
        this.newEvent.start.setHours(0, 0, 0, 0);
        this.newEvent.end.setHours(23, 59, 59, 59);
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
      this.confirmationMessage = 'Are you sure you want to delete this event?';
    },
    cancelAction() {
      this.confirmationMessage = '';
    },
    confirmAction() {
      this.confirmationMessage = '';
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
    },
    enforceTemporalCoherence() {
      if (this.newEvent.start > this.newEvent.end) {
        this.newEvent.end = new Date(this.newEvent.start);
      }
      if (this.newEvent.repetition.endDate < this.newEvent.end) {
        this.newEvent.repetition.endDate = new Date(this.newEvent.end);
      }

      const repFreq = this.newEvent.repetition.frequency;
      if (repFreq === 'daily' && !this.dailyRepetitionAllowed ||
        repFreq === 'weekly' && !this.weeklyRepetitionAllowed ||
        repFreq === 'monthly' && !this.monthlyRepetitionAllowed ||
        repFreq === 'yearly' && !this.yearlyRepetitionAllowed) {
        this.newEvent.repetition.frequency = 'never';
      }
    },
    repetitionOptionAllowed(option: string): boolean {
      if (this.newEvent.notification.when === 'atEvent') {
        return false;
      }
      else {
        const whenParts = this.newEvent.notification.when.split(' ');
        const optionParts = option.split(' ');

        const whenUnit = this.mapUnitToInt(whenParts[1]);
        const whenValue = Number(whenParts[0]);

        const optionUnit = this.mapUnitToInt(optionParts[1]);
        const optionValue = Number(optionParts[0]);

        return (optionUnit < whenUnit) || (optionUnit === whenUnit && optionValue < whenValue);
      }
    },
    mapUnitToInt(unit: string): number {
      switch (unit) {
        case 'minute':
        case 'minutes':
          return 1;
        case 'hour':
        case 'hours':
          return 2;
        case 'day':
        case 'days':
          return 3;
        case 'week':
        case 'weeks':
          return 4;
        default:
          return 0;
      }
    },
    enforceRepetitionCoherence() {
      if (!this.repetitionOptionAllowed(this.newEvent.notification.repeat)) {
        this.newEvent.notification.repeat = 'never';
      }
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
    repeatedNotificationAllowed(): boolean {
      return this.newEvent.notification.when !== 'atEvent';
    },
    formattedStartDate: {
      get(): string {
        return this.newEvent.start.toISOString().split('T')[0];
      },
      set(value: string) {
        const time = this.newStartTime;
        this.newEvent.start = new Date(value);
        this.newEvent.start.setHours(Number(time.split(':')[0]), Number(time.split(':')[1]));
        this.enforceTemporalCoherence();
      }
    },
    formattedEndDate: {
      get(): string {
        return this.newEvent.end.toISOString().split('T')[0];
      },
      set(value: string) {
        const time = this.newEndTime;
        this.newEvent.end = new Date(value);
        this.newEvent.end.setHours(Number(time.split(':')[0]), Number(time.split(':')[1]));
        this.enforceTemporalCoherence();
      }
    },
    formattedRepeatEndDate: {
      get(): string {
        return this.newEvent.repetition.endDate.toISOString().split('T')[0];
      },
      set(value: string) {
        this.newEvent.repetition.endDate = new Date(value);
        this.enforceTemporalCoherence();
      }
    },
    minEndDate(): string {
      return this.formattedStartDate;
    },
    minRepEndDate(): string {
      return this.formattedEndDate;
    },
    minEndTime(): string {
      if (timeService.sameDay(this.newEvent.start, this.newEvent.end)) {
        return this.newStartTime;
      }
      else {
        return '00:00';
      }
    },
    dailyRepetitionAllowed(): boolean {
      return timeService.sameDay(this.newEvent.start, this.newEvent.end);
    },
    weeklyRepetitionAllowed(): boolean {
      return timeService.sameWeek(this.newEvent.start, this.newEvent.end);
    },
    monthlyRepetitionAllowed(): boolean {
      return timeService.sameMonth(this.newEvent.start, this.newEvent.end);
    },
    yearlyRepetitionAllowed(): boolean {
      return timeService.sameYear(this.newEvent.start, this.newEvent.end);
    }
  }
});
</script>

<style scoped>
#event-upload {
  cursor: pointer;
}

hr {
  margin: 0.5rem 0;
}
</style>