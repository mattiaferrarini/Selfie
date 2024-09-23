<template>
  <div class="p-4 bg-white rounded-lg shadow border text-gray-600">
    <h3 class="text-lg font-semibold text-gray-800">Pomodoro</h3>
    <div v-if="type === 'settings'">
      <h4 class="font-semibold text-gray-800">Default settings </h4>
      <p>Work duration: {{ settings.workDuration }} minutes</p>
      <p>Pause duration: {{ settings.pauseDuration }} minutes</p>
      <p>Completed cycles: {{ settings.numberOfCycles }}</p>
      <router-link class="text-blue-500" :to="{name: 'pomodoro'}">Edit</router-link>
    </div>
    <div v-else>
      <h4 class="font-semibold text-gray-800">Stats</h4>
      <p>Completed activities: {{ stats.completed }}</p>
      <p>Completed cycles: {{ stats.completedCycles }}</p>
      <hr/>
      <p>Missing activities: {{ stats.missing }}</p>
      <p>Total cycles: {{ stats.missingTotalCycles }}</p>
      <p>Completed: {{ stats.missingCompletedCycles }}</p>
      <p>Missing: {{ stats.missingTotalCycles - stats.missingCompletedCycles }}</p>
    </div>
    <router-link v-if="stats.oldestActivityId != ''" :to="'/pomodoro/' + stats.oldestActivityId" class="text-blue-500">
      <hr/>
      Pomodoro più arretrato
    </router-link>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useAuthStore} from "@/stores/authStore";
import activityService from "@/services/activityService";

export default defineComponent({
  props: {
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      settings: {
        workDuration: 25,
        pauseDuration: 5,
        numberOfCycles: 4,
      },
      stats: {
        completed: 0,
        completedCycles: 0,
        missing: 0,
        missingTotalCycles: 0,
        missingCompletedCycles: 0,
        oldestActivityId: ''
      }
    }
  },
  methods: {},
  async created() {
    const pomodoroPreferences = useAuthStore().user.preferences.pomodoro;
    if (pomodoroPreferences) {
      this.settings = pomodoroPreferences;
    }
    this.stats = await activityService.getPomodoroStats();
  },
  watch: {
    date: {
      immediate: true,
      async handler() {
        this.stats = await activityService.getPomodoroStats();
      }
    }
  }
});
</script>