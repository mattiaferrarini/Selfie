<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-3 bg-tropical">
    <div class="animate-fade-in w-11/12 p-2 sm:p-5 rounded shadow-2xl shadow-emerald-600 bg-white">
      <div>{{ date }}</div>
      <div class="flex">
        <div class="p-1 w-full sm:w-1/4 relative" v-click-outside="() => closeTooltip(refs.showCalendarTooltip)">
          <div class="cursor-pointer absolute top-2 right-2" @click="toggleTooltip(refs.showCalendarTooltip)">
            <v-icon name="md-settings-round" :class="['h-5 w-5 m-1 duration-500',
            showCalendarTooltip ? ' rotate-180' : '']"/>
          </div>
          <CalendarPreview :date=date :weekly=calendarWeekly />
            <div v-if="showCalendarTooltip"
                 class="absolute top-9 right-2 bg-white border border-emerald-900 p-2 rounded-lg shadow z-10">
              <label for="weekly" class="font-semibold mr-2">Weekly</label>
              <input type="checkbox" v-model="calendarWeekly" id="weekly"/>
            </div>
        </div>
        <div class="p-1 w-full sm:w-1/4 relative" v-click-outside="() => closeTooltip(refs.showNotesTooltip)">
          <div class="cursor-pointer absolute top-2 right-2" @click="toggleTooltip(refs.showNotesTooltip)">
            <v-icon name="md-settings-round" :class="['h-5 w-5 m-1 duration-500',
            showNotesTooltip ? ' rotate-180' : '']"/>
          </div>
          <NotesPreview :date=date :desc=notesDescription />
          <div v-if="showNotesTooltip"
               class="absolute top-9 right-2 bg-white border border-emerald-900 p-2 rounded-lg shadow z-10">
            <label for="description" class="font-semibold mr-2">Descrizione</label>
            <input type="checkbox" v-model="notesDescription" id="description"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, Ref, ref} from "vue";
import {useDateStore} from "@/stores/dateStore";
import {storeToRefs} from "pinia";
import CalendarPreview from "@/components/CalendarPreview.vue";
import NotesPreview from "@/components/NotesPreview.vue";

export default defineComponent({
  methods: {ref},
  components: {NotesPreview, CalendarPreview},
  setup() {
    const dateStore = useDateStore();
    const date = storeToRefs(dateStore).currentDate;
    const showCalendarTooltip = ref(false);
    const showNotesTooltip = ref(false);
    const calendarWeekly = ref(false)
    const notesDescription = ref(false)

    const toggleTooltip = (tooltip: Ref) => {
      tooltip.value = !tooltip.value;
    };

    const closeTooltip = (tooltip: Ref) => {
      tooltip.value = false;
    };

    return {
      date,
      showCalendarTooltip,
      showNotesTooltip,
      refs: {
        showCalendarTooltip,
        showNotesTooltip,
      },
      toggleTooltip,
      closeTooltip,
      calendarWeekly,
      notesDescription,
    };
  },
});
</script>
