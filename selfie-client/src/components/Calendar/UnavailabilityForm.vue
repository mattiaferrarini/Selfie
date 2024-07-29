<template>
    <div class="bg-white p-4 rounded-lg shadow-lg w-4/5" @click.stop>
      <form class="flex flex-col" @submit="handleSubmit">
        <div>
          <label><input type="text" placeholder="Untitled Unavailability" required v-model="newTitle"></label><br>
        </div>
        <hr>
        <div>
          <label><input type="checkbox" v-model="newAllDay"> All-day</label><br>

          <div class="flex items-center justify-between w-full gap-4">
            <label> Start </label>
            <div class="flex gap-1">
              <input type="date" v-model="formattedStartDate">
              <input type="time" v-if="!newAllDay" v-model="newStartTime">
            </div>
          </div>

          <div class="flex items-center justify-between w-full gap-4">
            <label> End </label>
            <div class="flex gap-1">
              <input type="date" v-model="formattedEndDate">
              <input type="time" v-if="!newAllDay" v-model="newEndTime">
            </div>
          </div>
        </div>
        <hr>
        <div>
          <label class="flex items-center justify-between w-full gap-4">
            Repeat
            <select name="repeat" v-model="newRepeat">
              <option value="never">Never</option>
              <option value="everyday">Every day</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label v-if="repeatNew" class="flex items-center justify-between w-full gap-4">
            Until
            <select name="until" v-model="newUntil">
              <option value="infinity">Infinity</option>
              <option value="n-reps">N repetitions</option>
              <option value="date">Date</option>
            </select>
          </label>
          <label v-if="repeatNTimes" class="flex items-center justify-between w-full gap-4">
            Number of repetitions
            <input type="number" min="0" v-model="newNumberOfReps" style="max-width: 4em; text-align: center">
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

export default defineComponent({
props: {
  title: {
    type: String,
    default: ''
  },
  allDay: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  repeat: {
    type: String,
    default: 'never'
  },
  until: {
    type: String,
    default: 'infinity'
  },
  numberOfReps: {
    type: Number,
    default: 0
  },
  repeatEndDate: {
    type: Date,
    default: new Date()
  },
},
emits: ['closeForm', 'saveUnavailability'],
data() {
  return{
    newTitle: this.title,
    newAllDay: this.allDay,
    newStartDate: this.startDate,
    newEndDate: this.endDate,
    newStartTime: this.startTime,
    newEndTime: this.endTime,
    newRepeat: this.repeat,
    newUntil: this.until,
    newNumberOfReps: this.numberOfReps,
    newRepeatEndDate: this.repeatEndDate,
  }
},
methods: {
  closeForm() {
    console.log('closeForm');
    this.$emit('closeForm');
  },
  handleSubmit(event: Event) {
    event.preventDefault();
    const newUnav = {
        title: this.newTitle,
        allDay: this.newAllDay,
        startDate: this.newStartDate,
        endDate: this.newEndDate,
        startTime: this.newStartTime,
        endTime: this.newEndTime,
        repeat: this.newRepeat,
        until: this.newUntil,
        numberOfReps: this.newNumberOfReps,
        repeatEndDate: this.newRepeatEndDate,
    }
    this.$emit('saveUnavailability', newUnav);
  }
},
computed: {
  repeatNew() {
    return this.newRepeat !== 'never';
  },
  repeatNTimes() {
    return this.newUntil === 'n-reps';
  },
  repeatUntilDate() {
    return this.newUntil === 'date';
  },
  formattedStartDate: {
    get() {
      return this.newStartDate.toISOString().split('T')[0];
    },
    set(value: string) {
      this.newStartDate = new Date(value);
    }
  },
  formattedEndDate: {
    get() {
      return this.newEndDate.toISOString().split('T')[0];
    },
    set(value: string) {
      this.newEndDate = new Date(value);
    }
  },
  formattedRepeatEndDate: {
    get() {
      return this.repeatEndDate.toISOString().split('T')[0];
    },
    set(value: string) {
      this.newRepeatEndDate = new Date(value);
    }
  },
}
});
</script>

<style scoped>
/* Your component's styles go here */
</style>