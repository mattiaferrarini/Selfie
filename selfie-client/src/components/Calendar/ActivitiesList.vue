<template>
    <div>
        <h3>Activities</h3>
        <ul>
            <li v-for="activity in sortedActivities" :key="activity.id">
                <div class="flex align-center justify-between p-5 cursor-pointer" @click="activity.pomodoro ? goPomodoro(activity) : modifyActivity(activity)">
                        <h4 :class="{ done: activity.done }">{{ activity.title }}</h4>
                        <div class="flex gap-4">
                            {{ activity.pomodoro ?  activity.pomodoro.completedCycles[username] + '/' + activity.pomodoro.options.numberOfCycles + ' cicli' : '' }}
                            <button v-if="activity.pomodoro" @click="modifyActivity(activity)" @click.stop><v-icon name="md-modeeditoutline"></v-icon></button>
                            {{timeMethods.formatDayMonth(activity.deadline)}}
                            <button v-if="!activity.done" @click="markAsDone(activity)" @click.stop><v-icon name="md-done"></v-icon></button>
                            <button v-else @click="undoActivity(activity)" @click.stop><v-icon name="fa-undo"></v-icon></button>
                        </div>
                </div>
            </li>
        </ul>
        <p v-if="sortedActivities.length === 0">No activities</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import timeMethods from '../../services/timeService';
import router from "@/router";
import {useAuthStore} from "@/stores/authStore";
export default defineComponent({
    props: {
        activities: {
            type: Array,
            required: true
        },
        currentDate: {
            type: Date,
            required: true
        },
        view: {
            type: String,
            required: true
        }
    },
    emits: ['modifyActivity', 'markAsDone', 'undoActivity'],
    methods: {
        goPomodoro(activity: any) {
          router.push({name: "pomodoro", params: {activityId: activity.id}});
        },
        modifyActivity(activity: any) {
            this.$emit('modifyActivity', activity);
        },
        markAsDone(activity: any) {
            this.$emit('markAsDone', activity);
        },
        undoActivity(activity: any) {
            this.$emit('undoActivity', activity);
        },
    },
    computed: {
        sortedActivities(): any[] {
    
            const startOfPeriod = timeMethods.getStartOfCurrentPeriod(this.currentDate, this.view);
            const endOfPeriod = timeMethods.getEndOfCurrentPeriod(this.currentDate, this.view);

            let inPeriod = this.activities.filter((activity: any) => {
                return activity.deadline >= startOfPeriod && activity.deadline <= endOfPeriod;
            });

            inPeriod.sort((a: any, b: any) => {
                if (a.done && !b.done) {
                    return 1;
                } else if (!a.done && b.done) {
                    return -1;
                } else {
                    return a.deadline - b.deadline;
                }
            });

            return inPeriod;
        }
    },
    // Add the timeMethods property
    data() {
        return {
            timeMethods: timeMethods,
            username: useAuthStore().user.username
        };
    }
});
</script>

<style scoped>
.done {
    text-decoration: line-through;
}
</style>