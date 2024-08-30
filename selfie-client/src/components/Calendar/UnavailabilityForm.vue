<template>
  <div class="bg-white p-4 m-4 rounded-lg shadow-lg relative w-full max-w-[600px]" @click.stop>
    <div class="flex justify-end">
      <button @click="closeForm">
        <v-icon name="md-close" />
      </button>
    </div>
    <form class="flex flex-col" @submit="handleSubmit">
      <div>
        <label><input type="text" placeholder="Untitled Unavailability" required class="w-full"
            v-model="newUnavailability.title"></label><br>
      </div>
      <hr>
      <div>
        <label><input type="checkbox" v-model="newUnavailability.allDay"> All-day</label><br>

        <div class="flex items-center justify-between w-full gap-4 mt-3">
          <label> Start </label>
          <div class="flex gap-1">
            <input type="date" v-model="formattedStartDate">
            <input type="time" v-if="!newUnavailability.allDay" v-model="newStartTime">
          </div>
        </div>

        <div class="flex items-center justify-between w-full gap-4 mb-3">
          <label> End </label>
          <div class="flex gap-1">
            <input type="date" v-model="formattedEndDate" :min="minEndDate">
            <input type="time" v-if="!newUnavailability.allDay" v-model="newEndTime" :min="minEndTime">
          </div>
        </div>

        <div class="flex items-center justify-between w-full gap-8">
          <label for="timezone" class="flex-1">Time Zone</label>
          <select v-model="newUnavailability.timezone" id="timezone" class="w-1/2 sm:w-auto text-center rounded-md">
            <option v-for="tz in timeZones" :key="tz" :value="tz" style="word-wrap: break-word;">{{ tz }}</option>
          </select>
        </div>
      </div>
      <hr>
      <div>
        <label class="flex items-center justify-between w-full gap-4">
          Repeat
          <select name="repeat" v-model="newUnavailability.repetition.frequency">
            <option value="never">Never</option>
            <option v-if="dailyRepetitionAllowed" value="daily">Daily</option>
            <option v-if="weeklyRepetitionAllowed" value="weekly">Weekly</option>
            <option v-if="monthlyRepetitionAllowed" value="monthly">Monthly</option>
            <option v-if="yearlyRepetitionAllowed" value="yearly">Yearly</option>
          </select>
        </label>
        <label v-if="repeatNew" class="flex items-center justify-between w-full gap-4 mt-1">
          Until
          <select name="until" v-model="newUnavailability.repetition.until">
            <option value="infinity">Infinity</option>
            <option value="n-reps">N repetitions</option>
            <option value="date">Date</option>
          </select>
        </label>
        <label v-if="repeatNTimes" class="flex items-center justify-between w-full gap-4 mt-1">
          Number of repetitions
          <input type="number" min="1" v-model="newUnavailability.repetition.numberOfRepetitions"
            style="max-width: 4em; text-align: center">
        </label>
        <label v-if="repeatUntilDate" class="flex items-center justify-between w-full gap-4 mt-1">
          End date
          <input type="date" v-model="formattedRepeatEndDate" :min="minRepEndDate">
        </label>
      </div>
      <hr>
      <div class="flex w-full space-x-1 mt-8">
        <button v-if="modifying" type="button" @click="handleDeleteRequest"
          class="flex-1 bg-red-600 text-white p-2 rounded-lg">Delete</button>
        <button type="submit" class="flex-1 bg-emerald-600 text-white p-2 rounded-lg">Save</button>
      </div>
    </form>

    <ConfirmationPanel v-if="confirmationMessage.length > 0" :message="confirmationMessage" @cancel="cancelAction"
      @confirm="deleteUnavailability" />

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Unavailability } from '@/models/Unavailability';
import timeService from '@/services/timeService';
import { useAuthStore } from '@/stores/authStore';
import ConfirmationPanel from './ConfirmationPanel.vue';
import moment from 'moment-timezone';
import unavailabilityService from '@/services/unavailabilityService';

export default defineComponent({
  components: {
    ConfirmationPanel
  },
  props: {
    unavailability: {
      type: Object as () => Unavailability,
      required: true
    },
    modifying: {
      type: Boolean,
      defulat: false
    },
    currentDate: {
      type: Date,
      required: true
    }
  },
  emits: ['closeForm', 'saveUnavailability', 'deleteUnavailability'],
  data() {
    return {
      authStore: useAuthStore(),
      newUnavailability: { ...this.unavailability },
      newStartTime: "",
      newEndTime: "",
      confirmationMessage: "",
      timeZones: moment.tz.names()
    }
  },
  mounted() {
    this.onFormVisible();
  },
  methods: {
    onFormVisible() {
      if (!this.modifying) {
        this.newUnavailability.timezone = moment.tz.guess();
        this.newUnavailability.start = timeService.roundTime(new Date());
        this.newUnavailability.end = timeService.moveAheadByHours(this.newUnavailability.start, 1);
        this.newUnavailability.repetition.endDate = new Date(this.newUnavailability.end);
        this.newUnavailability.username = this.authStore.user.username;
      }
      else{
        this.newUnavailability.start = timeService.makeTimezoneLocal(this.newUnavailability.start, this.newUnavailability.timezone);
        this.newUnavailability.end = timeService.makeTimezoneLocal(this.newUnavailability.end, this.newUnavailability.timezone);
      }
      this.newStartTime = timeService.formatTime(this.newUnavailability.start);
      this.newEndTime = timeService.formatTime(this.newUnavailability.end);
    },
    closeForm() {
      this.$emit('closeForm');
    },
    handleSubmit(event: Event) {
      event.preventDefault();

      if (this.newUnavailability.allDay) {
        this.newUnavailability.start.setHours(0, 0, 0, 0);
        this.newUnavailability.end.setHours(23, 59, 59, 59);
      }
      else {
        this.newUnavailability.start.setHours(Number(this.newStartTime.split(':')[0]), Number(this.newStartTime.split(':')[1]));
        this.newUnavailability.end.setHours(Number(this.newEndTime.split(':')[0]), Number(this.newEndTime.split(':')[1]));
      }

      this.newUnavailability.start = timeService.convertToTimezone(this.newUnavailability.start, this.newUnavailability.timezone);
      this.newUnavailability.end = timeService.convertToTimezone(this.newUnavailability.end, this.newUnavailability.timezone);

      this.saveUnavailability(this.newUnavailability);
    },
    async saveUnavailability(unav: Unavailability) {

      let res: Unavailability;
      
      if(this.modifying)
        res = await unavailabilityService.modifyUnavailability(unav);
      else
        res = await unavailabilityService.addUnavailability(unav);

      this.$emit('saveUnavailability', res);
    },
    handleDeleteRequest() {
      this.confirmationMessage = "Are you sure you want to delete this unavailability?";
    },
    cancelAction() {
      this.confirmationMessage = "";
    },
    async deleteUnavailability() {
      this.confirmationMessage = "";
      await unavailabilityService.deleteUnavailability(this.newUnavailability);
      this.$emit('deleteUnavailability', this.newUnavailability);
    },
    enforceTemporalCoherence() {
      if (this.newUnavailability.start > this.newUnavailability.end) {
        this.newUnavailability.end = new Date(this.newUnavailability.start);
      }
      if (this.newUnavailability.repetition.endDate < this.newUnavailability.end) {
        this.newUnavailability.repetition.endDate = new Date(this.newUnavailability.end);
      }

      const repFreq = this.newUnavailability.repetition.frequency;
      if (repFreq === 'daily' && !this.dailyRepetitionAllowed ||
        repFreq === 'weekly' && !this.weeklyRepetitionAllowed ||
        repFreq === 'monthly' && !this.monthlyRepetitionAllowed ||
        repFreq === 'yearly' && !this.yearlyRepetitionAllowed) {
        this.newUnavailability.repetition.frequency = 'never';
      }
    }
  },
  computed: {
    repeatNew(): boolean {
      return this.newUnavailability.repetition.frequency !== 'never';
    },
    repeatNTimes(): boolean {
      return this.newUnavailability.repetition.until === 'n-reps';
    },
    repeatUntilDate(): boolean {
      return this.newUnavailability.repetition.until === 'date';
    },
    formattedStartDate: {
      get(): string {
        return this.newUnavailability
          .start.toISOString().split('T')[0];
      },
      set(value: string) {
        const time = this.newStartTime;
        this.newUnavailability.start = new Date(value);
        this.newUnavailability.start.setHours(Number(time.split(':')[0]), Number(time.split(':')[1]));
        this.enforceTemporalCoherence();
      }
    },
    formattedEndDate: {
      get(): string {
        return this.newUnavailability
          .end.toISOString().split('T')[0];
      },
      set(value: string) {
        const time = this.newEndTime;
        this.newUnavailability.end = new Date(value);
        this.newUnavailability.end.setHours(Number(time.split(':')[0]), Number(time.split(':')[1]));
        this.enforceTemporalCoherence();
      }
    },
    formattedRepeatEndDate: {
      get(): string {
        return this.newUnavailability
          .repetition.endDate.toISOString().split('T')[0];
      },
      set(value: string) {
        this.newUnavailability.repetition.endDate = new Date(value);
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
      if (timeService.sameDay(this.newUnavailability.start, this.newUnavailability.end)) {
        return this.newStartTime;
      }
      else {
        return '00:00';
      }
    },
    dailyRepetitionAllowed(): boolean {
      return timeService.sameDay(this.newUnavailability.start, this.newUnavailability.end);
    },
    weeklyRepetitionAllowed(): boolean {
      return timeService.sameWeek(this.newUnavailability.start, this.newUnavailability.end);
    },
    monthlyRepetitionAllowed(): boolean {
      return timeService.sameMonth(this.newUnavailability.start, this.newUnavailability.end);
    },
    yearlyRepetitionAllowed(): boolean {
      return timeService.sameYear(this.newUnavailability.start, this.newUnavailability.end);
    }
  }
});
</script>

<style scoped>
hr {
  margin: 0.5rem 0;
}

select {
    padding: 0.25rem;
    border-radius: 0.375rem;
    text-align: center;
}
</style>