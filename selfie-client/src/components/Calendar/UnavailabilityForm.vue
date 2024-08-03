<template>
  <div class="bg-white p-4 rounded-lg shadow-lg w-4/5" @click.stop>
    <div class="flex justify-end">
      <button @click="closeForm">
        <v-icon name="md-close" />
      </button>
    </div>
    <form class="flex flex-col" @submit="handleSubmit">
      <div>
        <label><input type="text" placeholder="Untitled Unavailability" required
            v-model="newUnavailability.title"></label><br>
      </div>
      <hr>
      <div>
        <label><input type="checkbox" v-model="newUnavailability.allDay"> All-day</label><br>

        <div class="flex items-center justify-between w-full gap-4">
          <label> Start </label>
          <div class="flex gap-1">
            <input type="date" v-model="formattedStartDate">
            <input type="time" v-if="!newUnavailability.allDay" v-model="newStartTime">
          </div>
        </div>

        <div class="flex items-center justify-between w-full gap-4">
          <label> End </label>
          <div class="flex gap-1">
            <input type="date" v-model="formattedEndDate">
            <input type="time" v-if="!newUnavailability.allDay" v-model="newEndTime">
          </div>
        </div>
      </div>
      <hr>
      <div>
        <label class="flex items-center justify-between w-full gap-4">
          Repeat
          <select name="repeat" v-model="newUnavailability.repetition.frequency">
            <option value="never">Never</option>
            <option value="everyday">Every day</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <label v-if="repeatNew" class="flex items-center justify-between w-full gap-4">
          Until
          <select name="until" v-model="newUnavailability.repetition.until">
            <option value="infinity">Infinity</option>
            <option value="n-reps">N repetitions</option>
            <option value="date">Date</option>
          </select>
        </label>
        <label v-if="repeatNTimes" class="flex items-center justify-between w-full gap-4">
          Number of repetitions
          <input type="number" min="0" v-model="newUnavailability.repetition.numberOfRepetitions"
            style="max-width: 4em; text-align: center">
        </label>
        <label v-if="repeatUntilDate" class="flex items-center justify-between w-full gap-4">
          End date
          <input type="date" v-model="formattedRepeatEndDate">
        </label>
      </div>
      <hr>
      <div class="flex w-full space-x-1">
        <button v-if="modifying" type="button" @click="deleteUnavailability"
          class="flex-1 bg-red-600 text-white p-1 rounded-lg">Delete</button>
        <button type="submit" class="flex-1 bg-emerald-600 text-white p-1 rounded-lg">Save</button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Unavailability } from '@/models/Unavailability';
import timeService from '@/services/timeService';
import { useAuthStore } from '@/stores/authStore';

export default defineComponent({
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
    }
  },
  mounted() {
    this.onFormVisible();
  },
  methods: {
    onFormVisible() {
      if (!this.modifying) {
        this.newUnavailability.start = timeService.roundTime(this.currentDate);
        this.newUnavailability.end = timeService.moveAheadByHours(this.newUnavailability.start, 1);
        this.newUnavailability.repetition.endDate = new Date(this.newUnavailability.end);
        this.newUnavailability.username = this.authStore.user.username;
      }
      this.newStartTime = `${String(this.newUnavailability.start.getHours()).padStart(2, '0')}:${String(this.newUnavailability.start.getMinutes()).padStart(2, '0')}`;
      this.newEndTime = `${String(this.newUnavailability.end.getHours()).padStart(2, '0')}:${String(this.newUnavailability.end.getMinutes()).padStart(2, '0')}`;
    },
    closeForm() {
      console.log('closeForm');
      this.$emit('closeForm');
    },
    handleSubmit(event: Event) {
      event.preventDefault();

      this.newUnavailability.start.setHours(Number(this.newStartTime.split(':')[0]), Number(this.newStartTime.split(':')[1]));
      this.newUnavailability.end.setHours(Number(this.newEndTime.split(':')[0]), Number(this.newEndTime.split(':')[1]));

      this.$emit('saveUnavailability', this.newUnavailability);
    },
    deleteUnavailability() {
      this.$emit('deleteUnavailability', this.unavailability);
    }
  },
  computed: {
    repeatNew() {
      return this.newUnavailability.repetition.frequency !== 'never';
    },
    repeatNTimes() {
      return this.newUnavailability.repetition.until === 'n-reps';
    },
    repeatUntilDate() {
      return this.newUnavailability.repetition.until === 'date';
    },
    formattedStartDate: {
      get() {
        return this.newUnavailability
          .start.toISOString().split('T')[0];
      },
      set(value: string) {
        this.newUnavailability
          .start = new Date(value);
      }
    },
    formattedEndDate: {
      get() {
        return this.newUnavailability
          .end.toISOString().split('T')[0];
      },
      set(value: string) {
        this.newUnavailability
          .end = new Date(value);
      }
    },
    formattedRepeatEndDate: {
      get() {
        return this.newUnavailability
          .repetition.endDate.toISOString().split('T')[0];
      },
      set(value: string) {
        this.newUnavailability
          .repetition.endDate = new Date(value);
      }
    },
  }
});
</script>

<style scoped>
/* Your component's styles go here */
</style>