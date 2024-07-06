<template>
  <div class="max-h-screen h-screen flex sm:flex-row flex-col items-center justify-center bg-emerald-400">
    <div class="sm:h-full relative">
      <div class="aspect-square w-full sm:h-full sm:w-min">
        <div class="absolute top-0 right-0 m-3 h-7 w-7 hover:rotate-180 duration-700" @click="invertTiming">
          <v-icon name="md-flipcameraandroid-outlined" class="h-full w-full" flip="horizontal" />
        </div>
        <div v-if="timing">
          <img src="@/assets/sloth_timer.png"/>
          <div
              class="absolute top-[54.4%] clock left-[32.5%] border-4 border-emerald-900 rounded-full bg-emerald-50 w-[23.5%] h-[23.5%]">
            <div class="text-xl sm:text-4xl font-bold w-full h-full content-center text-center">25:00</div>
          </div>
        </div>
        <div v-else>

        </div>
        <div class="sm:flex absolute gap-[4%] justify-center bottom-[2%] w-full hidden">
          <div class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
            <v-icon name="md-queuemusic" class="w-full h-full" />
          </div>
          <div class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
            <v-icon v-if="timing" name="md-pause-round" class="w-full h-full" />
            <v-icon v-else name="md-playarrow-outlined" class="w-full h-full" />
          </div>
          <div class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
            <v-icon name="md-skipnext" class="w-full h-full" />
          </div>
          <div class="border-2 flex border-emerald-900 rounded-full p-1 w-1/12 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
            <v-icon name="md-restartalt" class="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-center gap-[4%] pt-12 w-full sm:hidden">
      <div class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
        <v-icon name="md-queuemusic" class="w-full h-full" />
      </div>
      <div class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
        <v-icon v-if="timing" name="md-pause-round" class="w-full h-full" />
        <v-icon v-else name="md-playarrow-outlined" class="w-full h-full" />
      </div>
      <div class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 hover:text-emerald-50 aspect-square">
        <v-icon name="md-skipnext" class="w-full h-full" />
      </div>
      <div class="border-2 flex border-emerald-900 rounded-full p-1 w-1/6 bg-emerald-200 hover:bg-emerald-700 aspect-square">
        <v-icon name="md-restartalt" class="w-full h-full" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      timing: true,
    };
  },
  methods: {
    invertTiming() {
      this.timing = !this.timing;
    },
  },
});
</script>

<style scoped>
.clock {
  overflow: hidden;
}

.clock:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.125);
  -webkit-animation: 25s 1s linear infinite timer_indicator;
  animation: 25s 1s linear infinite timer_indicator;
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