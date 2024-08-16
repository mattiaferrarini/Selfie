<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-3 bg-tropical">
    <div class="fixed bottom-5 z-10 right-5">
      <div class="h-14 w-14 bg-emerald-400 text-white rounded-full border-2 border-emerald-950 cursor-pointer"
        @click.stop="setChatModal(true)">
        <span class="absolute -top-1 -right-1 flex h-3 w-3" v-if="unread">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
          <span class="relative border border-emerald-50 inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
        </span>
        <v-icon name="bi-chat-dots" class="w-full p-1.5 h-full" />
      </div>
    </div>
    <div class="animate-fade-in w-11/12 p-4 mt-3 sm:p-5 rounded-lg shadow-2xl shadow-emerald-600 bg-white">
      <div>{{ date }}</div>
      <div class="flex mt-4 flex-col sm:flex-row gap-4">
        <div class="w-full flex-1 relative" v-click-outside="() => closeTooltip(refs.showCalendarTooltip)">
          <div class="cursor-pointer absolute top-2 right-2" @click.stop="toggleTooltip(refs.showCalendarTooltip)">
            <v-icon name="md-settings-round" :class="['h-5 w-5 m-1 duration-500',
              showCalendarTooltip ? ' rotate-180' : '']" />
          </div>
          <CalendarPreview :date=date :weekly="calendarWeekly" :content="calendarContent" />
          <div v-if="showCalendarTooltip"
            class="absolute top-9 right-2 bg-white border border-emerald-900 p-2 rounded-lg shadow z-10 flex flex-col">
            <label for="weekly" class="font-semibold">Weekly 
              <input type="checkbox" class="ml-2" v-model="calendarWeekly" @change="updatePreferences" id="weekly" /> 
            </label>
            <select v-model="calendarContent" @change="updatePreferences" class="mt-2">
              <option value="all">All</option>
              <option value="events">Events</option>
              <option value="activities">Activities</option>
            </select>
          </div>
        </div>
        <div class="w-full flex-1 relative" v-click-outside="() => closeTooltip(refs.showNotesTooltip)">
          <div class="cursor-pointer absolute top-2 right-2" @click.stop="toggleTooltip(refs.showNotesTooltip)">
            <v-icon name="md-settings-round" :class="['h-5 w-5 m-1 duration-500',
              showNotesTooltip ? ' rotate-180' : '']" />
          </div>
          <NotesPreview :date=date :desc="notesDescription" />
          <div v-if="showNotesTooltip"
            class="absolute top-9 right-2 bg-white border border-emerald-900 p-2 rounded-lg shadow z-10">
            <label for="description" class="font-semibold mr-2">Descrizione</label>
            <input type="checkbox" v-model="notesDescription" @change="updatePreferences" id="description" />
          </div>
        </div>
        <div class="w-full flex-1 relative" v-click-outside="() => closeTooltip(refs.showPomodoroTooltip)">
          <div class="cursor-pointer absolute top-2 right-2" @click.stop="toggleTooltip(refs.showPomodoroTooltip)">
            <v-icon name="md-settings-round" :class="['h-5 w-5 m-1 duration-500',
              showPomodoroTooltip ? ' rotate-180' : '']" />
          </div>
          <PomodoroPreview :date=date :type="pomodoroType" />
          <div v-if="showPomodoroTooltip"
            class="absolute top-9 right-2 bg-white border border-emerald-900 p-2 rounded-lg shadow z-10">
            <select v-model="pomodoroType" @change="updatePreferences">
              <option value="settings">Impostazioni</option>
              <option value="stats">Statistiche</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showChatModal" class="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div v-click-outside="() => setChatModal(false)"
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 sm:p-5 rounded-lg">
        <button @click="setChatModal(false)" class="absolute top-1 right-1 text-red-500 rounded-full hover:bg-red-300">
          <v-icon name="md-close" class="w-5 h-5" />
        </button>
        <ChatView />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import { useDateStore } from "@/stores/dateStore";
import { storeToRefs } from "pinia";
import CalendarPreview from "@/components/CalendarPreview.vue";
import NotesPreview from "@/components/NotesPreview.vue";
import PomodoroPreview from "@/components/PomodoroPreview.vue";
import ChatView from "@/components/ChatComponent.vue";
import profileService from "@/services/profileService";
import { useAuthStore } from "@/stores/authStore";
import { useWebSocketStore } from "@/stores/wsStore";

export default defineComponent({
  methods: { ref },
  components: { PomodoroPreview, NotesPreview, CalendarPreview, ChatView },
  setup() {
    const dateStore = useDateStore();
    const homePreferences = useAuthStore().user.preferences.home;
    const date = storeToRefs(dateStore).currentDate;

    const showCalendarTooltip = ref(false);
    const showNotesTooltip = ref(false);
    const showPomodoroTooltip = ref(false);

    const calendarWeekly = ref(homePreferences.calendarWeekly);
    const calendarContent = ref(homePreferences.calendarContent);
    const notesDescription = ref(homePreferences.notesDescription);
    const pomodoroType = ref(homePreferences.pomodoroType);

    const showChatModal = ref(false);
    const wsStore = useWebSocketStore();
    const unread = storeToRefs(wsStore).unread;

    const toggleTooltip = (tooltip: Ref) => {
      tooltip.value = !tooltip.value;
    };

    const closeTooltip = (tooltip: Ref) => {
      tooltip.value = false;
    };

    const setChatModal = (bool: boolean) => {
      showChatModal.value = bool;
      wsStore.setChatModalOpen(bool);
    };

    const updatePreferences = () => {
      profileService.updateHomePreferences(calendarWeekly.value, calendarContent.value, notesDescription.value, pomodoroType.value);
    };

    return {
      date,
      unread,
      showCalendarTooltip,
      showNotesTooltip,
      showPomodoroTooltip,
      refs: {
        showCalendarTooltip,
        showNotesTooltip,
        showPomodoroTooltip,
      },
      toggleTooltip,
      closeTooltip,
      setChatModal,
      calendarWeekly,
      calendarContent,
      notesDescription,
      pomodoroType,
      updatePreferences,
      showChatModal,
    };
  },
});
</script>
