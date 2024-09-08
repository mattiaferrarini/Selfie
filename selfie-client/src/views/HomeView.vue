<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-3 bg-tropical">
    <div class="fixed bottom-5 z-10 right-5">
      <div class="h-14 w-14 bg-emerald-400 text-white rounded-full border-2 border-emerald-950 cursor-pointer"
           @click.stop="setChatModal(true)">
        <span v-if="unread" class="absolute -top-1 -right-1 flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
          <span class="relative border border-emerald-50 inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
        </span>
        <v-icon class="w-full p-1.5 h-full" name="bi-chat-dots"/>
      </div>
    </div>
    <div
        class="animate-fade-in sm:w-11/12 p-4 mt-5 sm:mt-3 mb-4 sm:p-5 rounded-lg shadow-xl shadow-emerald-600 bg-white">
      <h1 class="text-2xl sm:text-4xl font-bold text-emerald-600">Welcome, {{ realName }}!</h1>
      <h3 class="mt-2 sm:text-xl text-gray-700"> Manage your private, social and academic life with Selfie.</h3>
    </div>
    <div class="animate-fade-in w-full sm:w-11/12 p-4 sm:mt-3 sm:p-5 rounded-lg shadow-2xl shadow-emerald-600 bg-white">
      <div>{{ date }}</div>
      <div class="flex mt-4 flex-col sm:flex-row gap-4">
        <div v-click-outside="() => closeTooltip(refs.showCalendarTooltip)" class="w-full flex-1 relative">
          <div class="cursor-pointer absolute top-2 right-2" @click.stop="toggleTooltip(refs.showCalendarTooltip)">
            <v-icon :class="['h-5 w-5 m-1 duration-500',
              showCalendarTooltip ? ' rotate-180' : '']" name="md-settings-round"/>
          </div>
          <CalendarPreview :content="calendarContent" :date="new Date(date)" :weekly="calendarWeekly"/>
          <div v-if="showCalendarTooltip"
               class="absolute top-9 right-2 bg-white border border-emerald-900 p-2 rounded-lg shadow z-10 flex flex-col">
            <label class="font-semibold" for="weekly">Weekly
              <input id="weekly" v-model="calendarWeekly" class="ml-2" type="checkbox" @change="updatePreferences"/>
            </label>
            <select v-model="calendarContent" class="mt-2 p-1 rounded-md border" @change="updatePreferences">
              <option value="all">All</option>
              <option value="events">Events</option>
              <option value="activities">Activities</option>
              <option value="projects">Projects</option>
            </select>
          </div>
        </div>
        <div v-click-outside="() => closeTooltip(refs.showNotesTooltip)" class="w-full flex-1 relative">
          <div class="cursor-pointer absolute top-2 right-2" @click.stop="toggleTooltip(refs.showNotesTooltip)">
            <v-icon :class="['h-5 w-5 m-1 duration-500',
              showNotesTooltip ? ' rotate-180' : '']" name="md-settings-round"/>
          </div>
          <NotesPreview :category="notesCategory" :date="new Date(date)" :number="noteNumber"/>
          <div v-if="showNotesTooltip"
               class="absolute top-9 right-2 bg-white border border-emerald-900 p-2 rounded-lg shadow z-10 flex flex-col">
            <div>
              <label class="font-semibold mr-2" for="description">Category</label>
              <input id="description" v-model="notesCategory" type="checkbox" @change="updatePreferences"/>
            </div>
            <div class="w-min">
              <label class="font-semibold" for="number">Number:</label>
              <input id="number" v-model="noteNumber" class="border rounded" min="1" type="number"
                     @change="updatePreferences"/>
            </div>
          </div>
        </div>
        <div v-click-outside="() => closeTooltip(refs.showPomodoroTooltip)" class="w-full flex-1 relative">
          <div class="cursor-pointer absolute top-2 right-2" @click.stop="toggleTooltip(refs.showPomodoroTooltip)">
            <v-icon :class="['h-5 w-5 m-1 duration-500',
              showPomodoroTooltip ? ' rotate-180' : '']" name="md-settings-round"/>
          </div>
          <PomodoroPreview :date="new Date(date)" :type="pomodoroType"/>
          <div v-if="showPomodoroTooltip"
               class="absolute top-9 right-2 bg-white border border-emerald-900 p-2 rounded-lg shadow z-10">
            <select v-model="pomodoroType" class="p-1 rounded-md" @change="updatePreferences">
              <option value="settings">Settings</option>
              <option value="stats">Stats</option>
            </select>
          </div>
        </div>
        <div v-click-outside="() => closeTooltip(refs.showProjectsTooltip)" class="w-full flex-1 relative">
          <div class="cursor-pointer absolute top-2 right-2" @click.stop="toggleTooltip(refs.showProjectsTooltip)">
            <v-icon :class="['h-5 w-5 m-1 duration-500',
              showProjectsTooltip ? ' rotate-180' : '']" name="md-settings-round"/>
          </div>
          <PorjectPreview :assigned="onlyAssigned" :date="new Date(date)"/>
          <div v-if="showProjectsTooltip"
               class="absolute top-9 right-2 bg-white border border-emerald-900 p-2 rounded-lg shadow z-10">
            <div>
              <label class="font-semibold mr-2" for="onlyAssigned">Only assigned</label>
              <input id="onlyAssigned" v-model="onlyAssigned" type="checkbox" @change="updatePreferences"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showChatModal" class="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div v-click-outside="() => setChatModal(false)"
           class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 sm:p-5 rounded-lg">
        <button class="absolute top-1 right-1 text-red-500 rounded-full hover:bg-red-300" @click="setChatModal(false)">
          <v-icon class="w-5 h-5" name="md-close"/>
        </button>
        <ChatView/>
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
import PomodoroPreview from "@/components/PomodoroPreview.vue";
import ChatView from "@/components/ChatComponent.vue";
import profileService from "@/services/profileService";
import {useAuthStore} from "@/stores/authStore";
import {useWebSocketStore} from "@/stores/wsStore";
import PorjectPreview from "@/components/ProjectPreview.vue";

export default defineComponent({
  methods: {ref},
  components: {PorjectPreview, PomodoroPreview, NotesPreview, CalendarPreview, ChatView},
  setup() {
    const dateStore = useDateStore();
    const homePreferences = useAuthStore().user.preferences.home;
    const date = storeToRefs(dateStore).currentDate

    const realName = useAuthStore().user.realName;

    const showCalendarTooltip = ref(false);
    const showNotesTooltip = ref(false);
    const showPomodoroTooltip = ref(false);
    const showProjectsTooltip = ref(false);

    const calendarWeekly = ref(homePreferences.calendarWeekly);
    const calendarContent = ref(homePreferences.calendarContent);
    const notesCategory = ref(homePreferences.notesCategory);
    const noteNumber = ref(homePreferences.noteNumber);
    const pomodoroType = ref(homePreferences.pomodoroType);
    const onlyAssigned = ref(homePreferences.onlyAssigned);

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
      profileService.updatePreferences({
        home: {
          calendarWeekly: calendarWeekly.value,
          calendarContent: calendarContent.value,
          notesCategory: notesCategory.value,
          noteNumber: noteNumber.value,
          pomodoroType: pomodoroType.value,
          onlyAssigned: onlyAssigned.value
        }
      });
    };

    return {
      date,
      unread,
      showCalendarTooltip,
      showNotesTooltip,
      showPomodoroTooltip,
      showProjectsTooltip,
      refs: {
        showCalendarTooltip,
        showNotesTooltip,
        showPomodoroTooltip,
        showProjectsTooltip
      },
      toggleTooltip,
      closeTooltip,
      setChatModal,
      calendarWeekly,
      calendarContent,
      notesCategory,
      noteNumber,
      pomodoroType,
      onlyAssigned,
      updatePreferences,
      showChatModal,
      realName
    };
  },
});
</script>
