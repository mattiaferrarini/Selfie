<template>
  <div class="max-h-screen h-screen flex sm:flex-row flex-col items-center justify-center bg-emerald-400">
    <div class="sm:h-full relative">
      <div class="aspect-square w-full sm:h-full sm:w-min">
        <img src="@/assets/sloth_timer.png"/>
        <div
            :class="['absolute top-[54.4%] clock overflow-hidden left-[32.5%] border-4 border-emerald-900 rounded-full bg-emerald-50 w-[23.5%] h-[23.5%]', !timing ? ' animate-timer' : '']">
          <div class="font-bold w-full h-full content-center text-center relative">
            <span
                :class="['absolute left-[47%] bottom-1/2 w-[6%] h-2/5 origin-[50%_100%] border border-emerald-800 rounded-xl bg-green-500 ', timing ? 'animate-spin-seconds' : 'hidden']"></span>
            <p class="text-sm sm:text-2xl relative">{{pauseOrWork}}</p>
            <div class="sm:text-4xl flex items-center justify-center relative">
              {{formattedCounter}}
              <v-icon name="md-modeeditoutline" class="ml-0.5 sm:ml-1 w-3.5 h-3.5 sm:w-7 sm:h-7 cursor-pointer"/>
            </div>
            <p class="text-sm sm:text-2xl relative">{{formattedCycle}}</p>
          </div>
        </div>
        <div class="sm:flex absolute gap-[4%] justify-center bottom-[2%] w-full hidden">
          <div
              class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
            <v-icon name="md-queuemusic" class="w-full h-full"/>
          </div>
          <div
              @click.stop="toggleModal"
              class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
            <v-icon name="md-modeeditoutline" class="w-full h-full p-0.5"/>
          </div>
          <div
              @click="playOrPause"
              class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
            <v-icon v-if="timing" name="md-pause-round" class="w-full h-full"/>
            <v-icon v-else name="md-playarrow-outlined" class="w-full h-full"/>
          </div>
          <div
              class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
            <v-icon name="md-skipnext" class="w-full h-full"/>
          </div>
          <div
              class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
            <v-icon name="md-restartalt" class="w-full h-full"/>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-center gap-[4%] pt-12 w-full sm:hidden px-1">
      <div
          class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
        <v-icon name="md-queuemusic" class="w-full h-full"/>
      </div>
      <div
          @click.stop="toggleModal"
          class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
        <v-icon name="md-modeeditoutline" class="w-full h-full p-0.5"/>
      </div>
      <div
          class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
        <v-icon v-if="timing" name="md-pause-round" class="w-full h-full"/>
        <v-icon v-else name="md-playarrow-outlined" class="w-full h-full"/>
      </div>
      <div
          class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
        <v-icon name="md-skipnext" class="w-full h-full"/>
      </div>
      <div
          class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 aspect-square">
        <v-icon name="md-restartalt" class="w-full h-full"/>
      </div>
    </div>
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-60 overflow-y-auto h-full w-full content-center"
         id="my-modal">
      <div
          v-click-outside="() => showModal = false"
          class="relative mx-auto p-2 w-min sm:p-5 border-2 shadow-2xl border-emerald-900 rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Edit Timer Settings</h3>
          <div class="mt-2 px-7 py-3">
            <label for="workDuration" class="font-semibold">Work Duration (minutes)</label>
            <input type="number" v-model.number="workDuration" @change="calculateNumber" id="workDuration"
                   class="my-2 px-3 py-2 border border-gray-300 rounded-md" placeholder="Work Duration">
            <br/>
            <label for="pauseDuration" class="font-semibold">Pause Duration (minutes)</label>
            <input type="number" v-model.number="pauseDuration" @change="calculateNumber" id="pauseDuration"
                   class="my-2 px-3 py-2 border border-gray-300 rounded-md" placeholder="Pause Duration">
            <br/>
            <label for="numberOfCycles" class="font-semibold">Number of Cycles</label>
            <input type="number" v-model.number="numberOfCycles" @change=calculateNumber id="numberOfCycles"
                   class="my-2 px-3 py-2 border border-gray-300 rounded-md" placeholder="Number of Cycles">
            <br/>
            <label for="numberOfCycles" class="font-semibold">Inserisci Manualmente</label>
            <div class="inline-flex">
              <input type="number" v-model.number="computedNumber" @change="calculateCycles" id="numberOfCycles"
                     class="my-2 px-3 w-28 py-2 border border-gray-300 rounded-md" placeholder="Number of Cycles">
              <select v-model="selectingHours" @change="calculateCycles"
                      class="my-2 ml-1 px-3 py-2 border border-gray-300 rounded-md">
                <option value="true">Ore</option>
                <option value="false">Minuti</option>
              </select>
            </div>
          </div>
          <div class="items-center px-4 py-3">
            <button @click="saveChanges"
                    class="px-4 py-2 bg-green-500 border border-emerald-800 text-white rounded hover:bg-green-700">Save
            </button>
            <button @click="toggleModal"
                    class="ml-3 px-4 py-2 bg-gray-200 text-gray-900 border border-emerald-800 rounded hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  data() {
    return {
      timing: false,
      showModal: false,
      workDuration: 30,
      pauseDuration: 5,
      numberOfCycles: 5,
      selectingHours: 'false',
      computedNumber: 175,
      intervalRef: 0,
      counter: 30.5*60, // time is counted in reverse (pause - work) as time missing from the end
    };
  },
  computed: {
    formattedCounter(): string {
      let cycle_time = this.counter % ((this.workDuration + this.pauseDuration) * 60);
      let minutes = Math.floor((cycle_time - (cycle_time > this.pauseDuration * 60 ? this.pauseDuration * 60 : 0)) / 60 )
      let seconds = cycle_time % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
    pauseOrWork(): string {
      let cycle_time = this.counter % ((this.workDuration + this.pauseDuration) * 60);
      return cycle_time > this.pauseDuration * 60 ? 'Work' : 'Pause';
    },
    formattedCycle(): string {
      let cycle = Math.floor(this.counter / ((this.workDuration + this.pauseDuration) * 60));
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
          if (this.counter <= 0) {
            clearInterval(this.intervalRef);
          }
        }, 1000);
      }
      this.timing = !this.timing;
    },
    toggleModal() {
      this.showModal = !this.showModal;
    },
    saveChanges() {
      // TODO: update user?
      this.showModal = false;
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
    }
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