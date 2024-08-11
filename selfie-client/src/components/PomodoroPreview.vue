<template>
  <div class="p-4 bg-white rounded-lg shadow border m-4 text-gray-600">
    <div v-if="type === 'settings'">
      <h3 class="text-lg font-semibold text-gray-800">Impostazioni di default </h3>
      <p>Tempo di lavoro: {{ settings.workDuration }} minuti</p>
      <p>Tempo di pausa: {{ settings.pauseDuration }} minuti</p>
      <p>Cicli completati: {{ settings.numberOfCycles }}</p>
      <router-link to="/pomodoro" class="text-blue-500">Modifica</router-link>
    </div>
    <div v-else>
      <h3 class="text-lg font-semibold text-gray-800">Statistiche</h3>
      <p>Attività completate: {{ stats.completed }}</p>
      <p>Cicli completati: {{ stats.completedCycles }}</p>
      <hr/>
      <p>Attività mancanti ad oggi: {{ stats.missing }}</p>
      <p>Cicli totali: {{ stats.missingTotalCycles }}</p>
      <p>Completati: {{ stats.missingCompletedCycles }}</p>
      <p>Mancanti: {{ stats.missingTotalCycles - stats.missingCompletedCycles }}</p>
    </div>
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
      // Example events, replace with your actual events source
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
        missingCompletedCycles: 0
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
  }
});
</script>