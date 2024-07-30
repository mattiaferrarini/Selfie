<template>
    <div class="bg-white p-4 rounded-lg shadow-lg w-4/5" @click.stop>
      <form class="flex flex-col" @submit="handleSubmit">
        <div>
          <label><input type="text" placeholder="Untitled Unavailability" required v-model="newUnavailability.title"></label><br>
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
            <input type="number" min="0" v-model="newUnavailability.repetition.numberOfRepetitions" style="max-width: 4em; text-align: center">
          </label>
          <label v-if="repeatUntilDate" class="flex items-center justify-between w-full gap-4">
            End date
            <input type="date" v-model="formattedRepeatEndDate">
          </label>
        </div>
        <hr>
        <div class="flex w-full space-x-1">
          <button type="button" @click="closeForm" class="flex-1 bg-red-600 text-white p-1 rounded-lg">Cancel</button>
          <button type="submit" class="flex-1 bg-emerald-600 text-white p-1 rounded-lg">Save</button>
        </div>
      </form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Unavailability } from '@/models/Unavailability';

export default defineComponent({
props: {
  unavailability: {
    type: Object as () => Unavailability,
    required: true
  }
},
emits: ['closeForm', 'saveUnavailability'],
data() {
  return{
    newUnavailability: this.unavailability,
    newStartTime: `${String(this.unavailability.start.getHours()).padStart(2, '0')}:${String(this.unavailability.start.getMinutes()).padStart(2, '0')}`,
    newEndTime: `${String(this.unavailability.end.getHours()).padStart(2, '0')}:${String(this.unavailability.end.getMinutes()).padStart(2, '0')}`,
  }
},
methods: {
  closeForm() {
    console.log('closeForm');
    this.$emit('closeForm');
  },
  handleSubmit(event: Event) {
    event.preventDefault();
    this.$emit('saveUnavailability', this.newUnavailability

    );
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