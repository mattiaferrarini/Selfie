<template>
  <div class="max-h-screen h-screen flex sm:flex-row flex-col items-center justify-center bg-emerald-400">
    <div class="sm:h-full relative">
      <div class="aspect-square w-full sm:h-full sm:w-min">
        <img alt="A sloth holding a timer in his paws" src="@/assets/sloth_timer.png"/>
        <div
            :class="['absolute top-[54.4%] clock overflow-hidden left-[32.5%] border-4 border-emerald-900 rounded-full bg-emerald-50 w-[23.5%] h-[23.5%]', timing && pauseOrWork == 'Pause'  ? 'animate-timer' : '']">
          <div class="font-bold w-full h-full content-center text-center relative">
            <span
                :class="['absolute left-[47%] bottom-1/2 w-[6%] h-2/5 origin-[50%_100%] border border-emerald-800 rounded-xl bg-green-500', timing && pauseOrWork == 'Work' ? 'animate-spin-seconds' : 'hidden']"></span>
            <p class="text-sm sm:text-2xl relative">{{ pauseOrWork }}</p>
            <div class="sm:text-4xl flex items-center justify-center relative">
              {{ formattedCounter }}
              <v-icon class="relative z-20 ml-0.5 sm:ml-1 w-3.5 h-3.5 sm:w-7 sm:h-7 cursor-pointer" name="md-modeeditoutline"
                      @click.stop="openEditModal"/>
            </div>
            <p class="text-sm sm:text-2xl relative">{{ formattedCycle }}</p>
          </div>
        </div>
        <div class="sm:flex absolute gap-[4%] justify-center bottom-[2%] w-full hidden">
          <div
              class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square"
              @click.stop="toggleYoutubeModal">
            <v-icon class="w-full h-full" name="md-queuemusic"/>
          </div>
          <div
              class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square"
              @click.stop="toggleModal">
            <v-icon class="w-full h-full p-0.5" name="md-modeeditoutline"/>
          </div>
          <div
              class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square"
              @click="playOrPause">
            <v-icon v-if="timing" class="w-full h-full" name="md-pause-round"/>
            <v-icon v-else class="w-full h-full" name="md-playarrow-outlined"/>
          </div>
          <div
              class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square"
              @click="skipCycle">
            <v-icon class="w-full h-full" name="md-skipnext"/>
          </div>
          <div
              class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square"
              @click="restartCycle">
            <v-icon class="w-full h-full" name="md-restartalt"/>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-center gap-[4%] pt-12 w-full sm:hidden px-1">
      <div
          class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square"
          @click.stop="toggleYoutubeModal">
        <v-icon class="w-full h-full" name="md-queuemusic"/>
      </div>
      <div
          class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square"
          @click.stop="toggleModal">
        <v-icon class="w-full h-full p-0.5" name="md-modeeditoutline"/>
      </div>
      <div
          class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square"
          @click="playOrPause">
        <v-icon v-if="timing" class="w-full h-full" name="md-pause-round"/>
        <v-icon v-else class="w-full h-full" name="md-playarrow-outlined"/>
      </div>
      <div
          class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square"
          @click="skipCycle">
        <v-icon class="w-full h-full" name="md-skipnext"/>
      </div>
      <div
          class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 aspect-square"
          @click="restartCycle">
        <v-icon class="w-full h-full" name="md-restartalt"/>
      </div>
    </div>
    <div v-click-outside="closeYoutubeModal"
         :class="['fixed top-[15%] h-min p-2 w-min mx-auto sm:p-5 border-2 shadow-2xl border-emerald-900 rounded-md bg-white', showYoutubeModal ? '' : 'hidden']">
      <button class="absolute top-1 right-1 text-red-500 rounded-full hover:bg-red-300"
              @click="closeYoutubeModal">
        <v-icon class="w-5 h-5" name="md-close"/>
      </button>
      <iframe :src="videoUrl" allow="autoplay; encrypted-media" allowfullscreen
              class="w-full h-auto mb-2 bg-green-100"></iframe>
      <div class="inline-flex w-max items-center">
        <input v-model="inputVideoUrl" class="p-2 border border-gray-300 rounded-md" placeholder="Youtube URL"
               type="text">
        <v-icon class="w-10 ml-0.5 h-10 bg-green-500 border border-emerald-800 text-white rounded hover:bg-green-700" name="md-playarrow-outlined"
                @click="setVideo"/>
      </div>
    </div>
    <div v-if="showEditModal"
         class="fixed inset-0 z-30 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full content-center">
      <div
          v-click-outside="() => showEditModal = false"
          class="relative mx-auto p-2 w-fit sm:p-5 border-2 shadow-2xl border-emerald-900 rounded-md bg-white">
        <form class="mt-3 text-center" @submit.stop="saveEditChanges">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Edit Current Time</h3>
          <label class="font-semibold" for="setCycleNumber">Numero Ciclo</label>
          <br/>
          <input id="setCycleNumber" v-model.number="setCycleNumber" :max="numberOfCycles" class="my-2 px-3 py-2 border border-gray-300 rounded-md" min="1"
                 placeholder="3" type="number">
          <br/>
          <label class="font-semibold" for="setWork">Lavoro o Pausa</label>
          <br/>
          <select id="setWork" v-model="setWork" class="border rounded">
            <option value="true">Lavoro</option>
            <option value="false">Pausa</option>
          </select>
          <br/>
          <div class="inline-flex font-semibold">
            <label for="setMinutes">Minuti</label>&nbsp; : &nbsp;
            <label for="setSeconds">Secondi</label>
          </div>
          <br/>
          <div class="inline-flex items-center">
            <input id="setMinutes" v-model.number="setMinutes" :max="[setWork == 'true' ? workDuration : pauseDuration]"
                   class="my-2 px-3 py-2 border border-gray-300 rounded-md" min="0"
                   placeholder="23" type="number">
            <span class="text-2xl font-semibold mx-1 pb-1">:</span>
            <input id="setSeconds" v-model.number="setSeconds" :max="[setWork == 'true' ? (setMinutes == workDuration ? 0 : 59) : (setMinutes == pauseDuration ? 0 : 59)]"
                   class="my-2 px-3 py-2 border border-gray-300 rounded-md"
                   min="0"
                   placeholder="59" type="number">
          </div>
          <div class="items-center w-full px-4 py-3">
            <input class="px-3 py-1 bg-green-500 border border-emerald-800 text-white rounded hover:bg-green-700"
                   type="submit"
                   value="Save"/>
            <button class="ml-3 px-3 py-1 bg-gray-200 text-gray-900 border border-emerald-800 rounded hover:bg-gray-300"
                    @click="showEditModal = false">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    <div v-if="showModal"
         class="fixed inset-0 z-20 bg-gray-600 bg-opacity-60 overflow-y-auto h-full w-full content-center">
      <div
          v-click-outside="() => showModal = false"
          class="relative mx-auto p-2 w-min sm:p-5 border-2 shadow-2xl border-emerald-900 rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Edit Timer Settings</h3>
          <div class="mt-2 px-7 py-3">
            <label class="font-semibold" for="workDuration">Work Duration (minutes)</label>
            <input id="workDuration" v-model.number="workDuration" class="my-2 px-3 py-2 border border-gray-300 rounded-md" placeholder="Work Duration"
                   type="number" @change="calculateNumber">
            <br/>
            <label class="font-semibold" for="pauseDuration">Pause Duration (minutes)</label>
            <input id="pauseDuration" v-model.number="pauseDuration" class="my-2 px-3 py-2 border border-gray-300 rounded-md" placeholder="Pause Duration"
                   type="number" @change="calculateNumber">
            <br/>
            <label class="font-semibold" for="numberOfCycles">Number of Cycles</label>
            <input id="numberOfCycles" v-model.number="numberOfCycles" class="my-2 px-3 py-2 border border-gray-300 rounded-md" placeholder="Number of Cycles"
                   type="number" @change=calculateNumber>
            <br/>
            <label class="font-semibold" for="numberOfCycles">Inserisci Manualmente</label>
            <div class="inline-flex">
              <input id="numberOfCycles" v-model.number="computedNumber" class="my-2 px-3 w-28 py-2 border border-gray-300 rounded-md" placeholder="Number of Cycles"
                     type="number" @change="calculateCycles">
              <select v-model="selectingHours" class="my-2 ml-1 px-3 py-2 border border-gray-300 rounded-md"
                      @change="calculateCycles">
                <option value="true">Ore</option>
                <option value="false">Minuti</option>
              </select>
            </div>
          </div>
          <div class="items-center px-4 py-3">
            <button class="px-4 py-2 bg-green-500 border border-emerald-800 text-white rounded hover:bg-green-700"
                    @click="saveChanges">Save
            </button>
            <button class="ml-3 px-4 py-2 bg-gray-200 text-gray-900 border border-emerald-800 rounded hover:bg-gray-300"
                    @click="toggleModal">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, watch} from 'vue';
import {useAuthStore} from "@/stores/authStore";
import profileService from "@/services/profileService";
import router from "@/router";
import activityService from "@/services/activityService";
import {useDateStore} from "@/stores/dateStore";

export default defineComponent({
  data() {
    return {
      username: useAuthStore().user.username,
      timing: false,
      showModal: false,
      showYoutubeModal: false,
      showEditModal: false,
      videoUrl: '',
      inputVideoUrl: '',
      activityId: '',
      workDuration: 30,
      pauseDuration: 5,
      numberOfCycles: 5,
      selectingHours: 'false',
      computedNumber: 175,
      intervalRef: 0,
      counter: 35 * 60 * 5, // time is counted in reverse (pause - work) as time missing from the end
      setCycleNumber: 1,
      setMinutes: 0,
      setSeconds: 0,
      setWork: 'true',
    };
  },
  created() {
    const pomodoroPreferences = useAuthStore().user.preferences.pomodoro;
    if (router.currentRoute.value.params.activityId) {
      this.activityId = router.currentRoute.value.params.activityId as string;
      activityService.getActivityById(this.activityId).then((activity) => {
        this.workDuration = activity.pomodoro.options.workDuration;
        this.pauseDuration = activity.pomodoro.options.pauseDuration;
        this.numberOfCycles = activity.pomodoro.options.numberOfCycles;
        this.counter = (activity.pomodoro.options.numberOfCycles - activity.pomodoro.completedCycles[this.username]) * 60 * (this.workDuration + this.pauseDuration)
      });
    } else if (pomodoroPreferences) {
      this.workDuration = pomodoroPreferences.workDuration;
      this.pauseDuration = pomodoroPreferences.pauseDuration;
      this.numberOfCycles = pomodoroPreferences.numberOfCycles;
      this.counter = this.numberOfCycles * 60 * (this.workDuration + this.pauseDuration)
    }
    const dateStore = useDateStore();
    watch(
        () => dateStore.timeDiff,
        (newTimeDiff) => {
          if (this.timing) {
            this.counter = Math.trunc(Math.min(Math.max(this.counter - newTimeDiff / 1000, 0), this.numberOfCycles * 60 * (this.workDuration + this.pauseDuration)));
            if (this.activityId)
              activityService.modifyActivity({
                id: this.activityId,
                pomodoro: {
                  options: {
                    workDuration: this.workDuration,
                    pauseDuration: this.pauseDuration,
                    numberOfCycles: this.numberOfCycles,
                  },
                  completedCycles: {
                    [this.username]: this.numberOfCycles - Math.floor(this.counter / ((this.workDuration + this.pauseDuration) * 60))
                  }
                }
              });
          }
        },
        {immediate: true}
    );
  },
  computed: {
    formattedCounter(): string {
      let cycle_time = this.counter % ((this.workDuration + this.pauseDuration) * 60);
      let minutes = Math.floor((cycle_time - (cycle_time > this.pauseDuration * 60 ? this.pauseDuration * 60 : 0)) / 60)
      let seconds = cycle_time % 60;
      // set minutes if it's the start of a cycle and pad seconds
      (this.counter % ((this.workDuration + this.pauseDuration) * 60) == 0) && (minutes = this.workDuration);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
    pauseOrWork(): string {
      let cycle_time = this.counter % ((this.workDuration + this.pauseDuration) * 60);
      return cycle_time > this.pauseDuration * 60 || cycle_time == 0 ? 'Work' : 'Pause';
    },
    formattedCycle(): string {
      let cycle = Math.floor(this.counter / ((this.workDuration + this.pauseDuration) * 60));
      cycle == this.numberOfCycles && (cycle -= 1);
      return `${this.numberOfCycles - cycle}/${this.numberOfCycles}`;
    },
  },
  methods: {
    playOrPause() {
      if (this.timing) {
        clearInterval(this.intervalRef);
      } else {
        this.intervalRef = setInterval(() => {
          this.counter--;
          let remainingCycleTime = this.counter % ((this.workDuration + this.pauseDuration) * 60);
          if (this.activityId && remainingCycleTime == 0) {
            activityService.modifyActivity({
              id: this.activityId,
              pomodoro: {
                options: {
                  workDuration: this.workDuration,
                  pauseDuration: this.pauseDuration,
                  numberOfCycles: this.numberOfCycles,
                },
                completedCycles: {
                  [this.username]: this.numberOfCycles - Math.floor(this.counter / ((this.workDuration + this.pauseDuration) * 60))
                }
              }
            });
          }
          if ((remainingCycleTime == this.pauseDuration * 60 || remainingCycleTime == 0) && this.counter > 0) {
            Notification.permission === 'granted' && new Notification('Pomodoro', {
              body: remainingCycleTime == 0 ? 'Pause time is over!' : 'Work time is over!',
            });
          } else if (this.counter <= 0) {
            clearInterval(this.intervalRef);
            this.counter = 0;
            this.timing = false;
            if (this.activityId) {
              activityService.modifyActivity({id: this.activityId, done: true});
            }
            Notification.permission === 'granted' && new Notification('Pomodoro', {
              body: 'Pomodoro is over!',
            });
          }
        }, 1000);
      }
      this.timing = !this.timing;
    },
    skipCycle() {
      let cycle = Math.floor(this.counter / ((this.workDuration + this.pauseDuration) * 60));
      this.counter = cycle * (this.workDuration + this.pauseDuration) * 60;
      this.activityId && activityService.modifyActivity({
        id: this.activityId,
        pomodoro: {
          options: {
            workDuration: this.workDuration,
            pauseDuration: this.pauseDuration,
            numberOfCycles: this.numberOfCycles,
          },
          completedCycles: {
            [this.username]: this.numberOfCycles - cycle
          }
        }
      });
    },
    restartCycle() {
      let cycle = Math.floor(this.counter / ((this.workDuration + this.pauseDuration) * 60));
      this.counter = (cycle + 1) * (this.workDuration + this.pauseDuration) * 60;
    },
    toggleModal() {
      if (this.timing) {
        clearInterval(this.intervalRef);
        this.timing = false;
      }
      this.showModal = !this.showModal;
    },
    toggleYoutubeModal() {
      this.showYoutubeModal = !this.showYoutubeModal;
    },
    saveChanges() {
      if (this.activityId) {
        activityService.modifyActivity({
          id: this.activityId,
          pomodoro: {
            options: {
              workDuration: this.workDuration,
              pauseDuration: this.pauseDuration,
              numberOfCycles: this.numberOfCycles
            },
            completedCycles: {}
          }
        });
      } else {
        profileService.updatePreferences({
          pomodoro: {
            workDuration: this.workDuration,
            pauseDuration: this.pauseDuration,
            numberOfCycles: this.numberOfCycles
          }
        });
      }
      this.showModal = false;
    },
    openEditModal() {
      if (this.timing) {
        clearInterval(this.intervalRef);
        this.timing = false;
      }
      this.showEditModal = true
    },
    saveEditChanges() {
      this.counter = (this.numberOfCycles - this.setCycleNumber) * 60 * (this.workDuration + this.pauseDuration) + (this.setWork == 'true' ? this.pauseDuration * 60 : 0) + this.setMinutes * 60 + this.setSeconds;
      this.activityId && activityService.modifyActivity({
        id: this.activityId,
        pomodoro: {
          options: {
            workDuration: this.workDuration,
            pauseDuration: this.pauseDuration,
            numberOfCycles: this.numberOfCycles
          },
          completedCycles: {[this.username]: this.setCycleNumber - 1}
        }
      });
      this.showEditModal = false;
    },
    calculateNumber: function () {
      let minutes = (this.workDuration + this.pauseDuration) * this.numberOfCycles;
      if (minutes % 60 == 0) {
        this.selectingHours = 'true';
        this.computedNumber = minutes / 60;
      } else {
        this.selectingHours = 'false';
        this.computedNumber = minutes;
      }
    },
    calculateCycles: function () {
      let cycle = this.workDuration + this.pauseDuration
      this.numberOfCycles = Math.floor((this.selectingHours == 'true') ? this.computedNumber * 60 / cycle : this.computedNumber / cycle);
    },
    getId: function (url: string) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);

      return (match && match[2].length === 11)
          ? match[2]
          : null;
    },
    setVideo: function () {
      this.videoUrl = `https://www.youtube.com/embed/${this.getId(this.inputVideoUrl)}`;
    },
    closeYoutubeModal: function () {
      this.showYoutubeModal = false;
    },
  },
});
</script>

<style scoped>
.clock:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
}

.animate-timer:after {
  background-color: rgba(0, 0, 0, 0.125);
  -webkit-animation: 60s 1s linear infinite timer_indicator;
  animation: 60s 1s linear infinite timer_indicator;
}

@-webkit-keyframes timer_indicator {
  100% {
    transform: translateY(100%);
  }
}

@keyframes timer_indicator {
  100% {
    transform: translateY(100%);
  }
}
</style>