<template>
    <div class="w-full flex justify-center">
        <div class="py-8 px-4 sm:p-8"
            :class="{ 'flex flex-col gap-4 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full': view !== 'day', 'w-full box-content max-w-[600px]': view === 'day' }">
            <div v-for="(date, index) in datesToDisplayWithPlaceholders" :key="index" class="self-start w-full">
                <div v-if="date" class="grid-item rounded-lg shadow-md overflow-hidden pb-4 relative bg-slate-50"
                    :class="{ 'opacity-40': !timeMethods.sameMonth(date, currentDate) && view === 'month' }">
                    <div class="flex align-center justify-between p-2 mb-2"
                        :id="String(date.toISOString().substring(0, 10))"
                        :class="{ 'bg-emerald-600': timeMethods.isWeekend(date), 'bg-gray-400': !timeMethods.isWeekend(date) }">
                        <h3 class="font-bold text-white">{{ String(date.getDate()).padStart(2, '0') }}/{{
                            String(date.getMonth() +
                                1).padStart(2, '0') }}
                        </h3>
                        <h3 class=" text-white">{{ timeMethods.getDayOfWeek(date) }}</h3>
                    </div>
                    <div class="px-2 min-h-[10px]">
                        <div v-if="includeEvents && (eventsForDay(date).length > 0 || view === 'day')" class="mt-4">
                            <h4 class="font-medium text-gray-700 mb-1">Events</h4>
                            <ul>
                                <li v-for="event in eventsForDay(date)" :key="event.id" class="clickable-item">
                                    <hr>
                                    <div class="flex align-center justify-between py-1.5" @click.stop="modifyEvent(event[0])">
                                        <h5>{{ event[0].title }}</h5>
                                        <p>{{ event[1] }}</p>
                                    </div>
                                </li>
                            </ul>
                            <p class="mt-2 text-gray-700" v-if="eventsForDay(date).length === 0">No events today!</p>
                            <hr v-else>
                        </div>
                        <div v-if="includeActivities && (activitiesForTheDay(date).length > 0 || view === 'day')" class="mt-4">
                            <h4 class="font-medium text-gray-700 mb-1">Activities</h4>
                            <ul>
                                <li v-for="activity in activitiesForTheDay(date)" :key="activity.id"
                                    class="clickable-item">
                                    <hr>
                                    <div class="flex align-center justify-between py-1.5"
                                        :class="{ late: isLateActivity(activity, date) }"
                                        @click.stop="activity.pomodoro ? goPomodoro(activity) : modifyActivity(activity)">
                                        <h5 :class="{ done: activity.done }">{{ activity.title }}</h5>
                                        <div class="flex flex-wrap justify-end space-x-4">
                                            <span>{{ activity.pomodoro ? activity.pomodoro.completedCycles[username] +
                                                '/' +
                                                activity.pomodoro.options.numberOfCycles + ' cycles' : '' }}</span>
                                            <button v-if="activity.pomodoro" @click.stop="modifyActivity(activity)">
                                                <v-icon name="md-modeeditoutline"></v-icon></button>
                                            <button v-if="!activity.done" @click.stop="markAsDone(activity)">
                                                <v-icon name="md-done"></v-icon></button>
                                            <button v-else @click.stop="undoActivity(activity)"><v-icon
                                                    name="fa-undo"></v-icon></button>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <p class="mt-2 text-gray-700" v-if="activitiesForTheDay(date).length === 0">No activities end today!</p>
                            <hr v-else>
                        </div>
                        <div v-if="includeProjects && (projectActivitiesForTheDay(date).length > 0 || view === 'day')" class="mt-4">
                            <h4 class="font-medium text-gray-700 mb-1">Projects</h4>
                            <ul>
                                <li v-for="activity in projectActivitiesForTheDay(date)" :key="activity.id"
                                    class="clickable-item">
                                    <hr>
                                    <div class="flex align-center gap-2 py-1.5" :class="{ late: isLateActivity(activity, date) }" @click.stop="modifyActivity(activity)">
                                        <div v-if="activity.start && timeMethods.sameDate(activity.start, date)" class="bg-blue-500 px-1 rounded-md text-white">
                                            Start
                                        </div>
                                        <div v-else class="bg-orange-400 px-1 rounded-md text-white">
                                            Deadline
                                        </div>
                                        <h5 :class="{ done: activity.done }">{{ activity.title }}</h5>
                                    </div>
                                </li>
                            </ul>
                            <p class="mt-2 text-gray-700" v-if="projectActivitiesForTheDay(date).length === 0">No project acitivities start or end today!</p>
                            <hr v-else>
                        </div>
                        <div v-if="includeUnavailable && (unavailabiltiesForTheDay(date).length > 0 || view === 'day')" class="mt-4">
                            <h4 class="font-medium text-gray-700">Unavailabilities</h4>
                            <ul>
                                <li v-for="unav in unavailabiltiesForTheDay(date)" :key="unav.id"
                                    class="clickable-item">
                                    <hr>
                                    <div class="flex align-center justify-between py-1.5"
                                        @click.stop="modifyUnavailability(unav[0])">
                                        <h5>{{ unav[0].title }}</h5>
                                        <p>{{ unav[1] }}</p>
                                    </div>
                                </li>
                            </ul>
                            <p class="mt-2 text-gray-700" v-if="unavailabiltiesForTheDay(date).length === 0">You are free today!</p>
                            <hr v-else>
                        </div>
                    </div>
                </div>
                <div v-else class="m-8 grid-item empty-cell"></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import timeMethods from '../../services/timeService';
import eventRecurrenceService from '@/services/eventRecurrenceService';
import { CalendarEvent } from '@/models/Event';
import { Unavailability } from '@/models/Unavailability';
import { Activity } from '@/models/Activity';
import { useDateStore } from '@/stores/dateStore';
import router from "@/router";
import { useAuthStore } from "@/stores/authStore";

export default defineComponent({
    name: 'AppointmentsCalendar',
    props: {
        currentDate: {
            type: Date,
            required: true
        },
        view: {
            type: String,
            required: true
        },
        allEvents: {
            type: Array as PropType<CalendarEvent[]>,
            required: true
        },
        includeEvents: {
            type: Boolean,
            required: true
        },
        includeUnavailable: {
            type: Boolean,
            required: true
        },
        includeActivities: {
            type: Boolean,
            required: true
        },
        includeProjects: {
            type: Boolean,
            required: true
        },
        allActivities: {
            type: Array as PropType<Activity[]>,
            required: false
        },
        allUnavailabilities: {
            type: Array as PropType<Unavailability[]>,
            required: false
        }
    },
    emits: ['modifyEvent', 'modifyActivity', 'markAsDone', 'undoActivity', 'modifyUnavailability'],
    data() {
        return {
            timeMethods: timeMethods,
            dateStore: useDateStore(),
            username: useAuthStore().user.username
        };
    },
    methods: {
        eventsForDay(date: Date): any[] {
            return this.filterAndSortForDay(this.allEvents, date);
        },
        formatEventTime(event: { event: any, dates: { start: Date, end: Date } }, date: Date): string {
            let startOfDay: Date = timeMethods.getStartOfDay(date);
            let endOfDay: Date = timeMethods.getEndOfDay(date);

            let eventStart = event.dates.start;
            let eventEnd = event.dates.end;

            let start = eventStart <= startOfDay ? startOfDay : eventStart;
            let end = eventEnd >= endOfDay ? endOfDay : eventEnd;

            if ( Math.abs(start.getTime() - startOfDay.getTime()) < 1000 && Math.abs(endOfDay.getTime() - end.getTime()) < 1000)
                return "All day";
            else
                return `${start.getHours().toString()}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString()}:${end.getMinutes().toString().padStart(2, '0')}`;
        },
        modifyEvent(event: any) {
            this.$emit('modifyEvent', event);
        },
        activitiesForTheDay(date: Date): Activity[] {
            const dailyActivities = this.activitiesForDate(date);
            return dailyActivities.filter((activity: Activity) => {
                return !activity.projectId;
            });
        },
        projectActivitiesForTheDay(date: Date): Activity[] {
            const dailyActivities = this.activitiesForDate(date);
            return dailyActivities.filter((activity: Activity) => {
                return activity.projectId;
            });
        },
        activitiesForDate(date: Date): Activity[]{
            const startOfDay = timeMethods.getStartOfDay(date);
            if (this.allActivities) {
                return this.allActivities.filter((activity: Activity) => {
                    return timeMethods.sameDate(activity.deadline, date) ||
                        (!activity.done && activity.deadline < startOfDay && startOfDay < timeMethods.getEndOfDay(this.today)) ||
                        (activity.start && activity.projectId && timeMethods.sameDate(activity.start, date));
                }).sort((a: any, b: any) => {
                    if (a.done && !b.done) {
                        return 1;
                    } else if (!a.done && b.done) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
            }
            else {
                return [];
            }
        },
        goPomodoro(activity: any) {
            router.push({ name: "pomodoro", params: { activityId: activity.id } });
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
        unavailabiltiesForTheDay(date: Date): any[] {
            if (this.allUnavailabilities === undefined)
                return [];
            else
                return this.filterAndSortForDay(this.allUnavailabilities, date);
        },
        filterAndSortForDay(events: any[], date: Date): any[] {
            // get the period of the next repetition (relative to this date)
            let withDates = events.map((event: any) => {
                return { event: event, dates: this.getNextRepetition(event, date) };
            });

            // remove repetitions that are not on the date
            const startOfDay = timeMethods.getStartOfDay(date);
            const endOfDay = timeMethods.getEndOfDay(date);
            let inRange = withDates.filter((event: {event: any, dates: {start: Date, end: Date}}) => {
                return event.dates.start <= endOfDay && event.dates.end >= startOfDay;
            });

            // remove repetitions that are not valid
            let valid = inRange.filter((event: {event: any, dates: {start: Date, end: Date}}) => {
                return this.isValidRepetition(event.event, event.dates.start, event.dates.end);
            });

            // format the time of the event for display
            let eventPairs = valid.map(event => [event.event, this.formatEventTime(event, date)]);

            // sort the events by start time
            eventPairs.sort((a: any, b: any) => {
                let aTime = a[1];
                let bTime = b[1];
                if (aTime === "All day" && bTime !== "All day") {
                    return -1;
                } else if (aTime !== "All day" && bTime === "All day") {
                    return 1;
                } else {
                    return a[0].start - b[0].start;
                }
            });

            return eventPairs;
        },
        modifyUnavailability(unav: any) {
            this.$emit('modifyUnavailability', unav);
        },
        getNextRepetition(event: any, referenceDate: Date): { start: Date, end: Date } {
            return eventRecurrenceService.getNextRepetition(event, referenceDate);
        },
        // this assumes that the provided dates were obtained from the getNextRepetition method
        isValidRepetition(event: any, repStart: Date, repEnd: Date): boolean {
            return eventRecurrenceService.isValidRepetition(event, repStart, repEnd);
        },
        isLateActivity(activity: Activity, date: Date): boolean {
            return !activity.done && activity.deadline < timeMethods.getStartOfDay(this.today);
        }
    },
    computed: {
        today(): Date {
            return new Date(this.dateStore.getCurrentDate());
        },
        datesToDisplay(): Date[] {
            if (this.view === 'day') {
                return [this.currentDate];
            } else if (this.view === 'week') {
                const startOfWeek = timeMethods.getFirstDayOfWeek(this.currentDate);
                const endOfWeek = timeMethods.getLastDayOfWeek(this.currentDate);

                const weekDates = [];
                const currentDateOfWeek = new Date(startOfWeek);
                while (currentDateOfWeek <= endOfWeek) {
                    weekDates.push(new Date(currentDateOfWeek));
                    currentDateOfWeek.setDate(currentDateOfWeek.getDate() + 1);
                }
                return weekDates;
            } else if (this.view === 'month') {
                const startOfMonth = timeMethods.getFirstDayOfMonth(this.currentDate);
                const endOfMonth = timeMethods.getLastDayOfMonth(this.currentDate);

                const startOfPeriod = timeMethods.getFirstDayOfWeek(startOfMonth);
                const endOfPeriod = timeMethods.getLastDayOfWeek(endOfMonth);

                const monthDates = [];
                const currentDateOfMonth = new Date(startOfPeriod);
                while (currentDateOfMonth <= endOfPeriod) {
                    monthDates.push(new Date(currentDateOfMonth));
                    currentDateOfMonth.setDate(currentDateOfMonth.getDate() + 1);
                }
                return monthDates;
            } else {
                return [];
            }
        },
        datesToDisplayWithPlaceholders(): any[] {
            if (this.view !== 'month') {
                return this.datesToDisplay;
            }

            const dates = this.datesToDisplay;
            const datesWithPlaceholders = [];

            for (let i = 0; i < dates.length; i++) {
                datesWithPlaceholders.push(dates[i]);
                if (timeMethods.getNormalizedDayOfWeek(dates[i]) === 6) {
                    datesWithPlaceholders.push(null); // Insert a placeholder
                }
            }
            return datesWithPlaceholders;
        }
    },
});
</script>

<style scoped>
.grid-item:nth-child(7n)::after {
    content: '';
    grid-column: span 1;
}

.done {
    text-decoration: line-through;
}

.clickable-item {
    cursor: pointer;
}

.clickable-item:hover {
    background-color: #f3f4f6;
}

.late {
    color: red;
}
</style>