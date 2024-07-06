<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-3 bg-tropical">
    <div class="animate-fade-in w-11/12 p-2 sm:p-5 rounded shadow-2xl shadow-emerald-600 bg-white">
      <div class="flex">
        <div>{{date.date}}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useDateStore} from "@/stores/dateStore";
import {storeToRefs} from "pinia";

export default defineComponent({
  setup() {
    const dateStore = useDateStore();
    const date = storeToRefs(dateStore).currentDate;

    return {
      date
    };
  },
});
</script>
