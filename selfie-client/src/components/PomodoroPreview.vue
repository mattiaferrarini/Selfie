<template>
  <div class="p-4 bg-white rounded-lg shadow border m-4">
    <h3 class="text-lg font-semibold text-gray-800">Ultimo Pomodoro</h3>
    <p class="text-sm text-gray-600">Tempo di lavoro: {{ ultimoPomodoro.workDuration }} minuti</p>
    <p class="text-sm text-gray-600">Tempo di pausa: {{ ultimoPomodoro.pauseDuration }} minuti</p>
    <p class="text-sm text-gray-600">Cicli completati: {{ ultimoPomodoro.numberOfCycles }}</p>
    <p class="text-sm text-gray-600">In data: {{ ultimoPomodoro.date }}</p>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

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
      ultimoPomodoro: {
        workDuration: 25, // TODO: Esempio di dati, sostituire con dati reali
        pauseDuration: 5,
        numberOfCycles: 4,
        date: Date(),
      }
    }
  },
  methods: {
  },
});
</script>