<template>
    <div class="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <template v-for="(date, index) in datesToDisplayWithPlaceholders" :key="index">
            <div v-if="date" class="m-4 sm:m-8 grid-item">
                <div class="flex align-center justify-between border-t-2 border-b-2 border-gray-300 mb-2"
                    :class="{ 'bg-emerald-500': timeMethods.isWeekend(date), 'bg-white': !timeMethods.isWeekend(date) }">
                    <h3>{{ String(date.getDate()).padStart(2, '0') }}/{{ String(date.getMonth() + 1).padStart(2, '0') }}
                    </h3>
                    <h3>{{ timeMethods.getDayOfWeek(date) }}</h3>
                </div>
                <div v-if="includeEvents" class="mb-2">
                    <h4 class="font-bold">Events</h4>
                    <ul>
                        <li v-for="event in eventsForDay(date)" :key="event.id" class="clickable-item">
                            <div class="flex align-center justify-between" @click="modifyEvent(event[0])">
                                <h5>{{ event[0].title }}</h5>
                                <p>{{ event[1] }}</p>
                            </div>
                        </li>
                    </ul>
                    <p v-if="eventsForDay(date).length === 0">No events</p>
                </div>
                <div v-if="includeActivities">
                    <h4 class="font-bold">Activities</h4>
                    <ul>
                        <li v-for="activity in activitiesForTheDay(date)" :key="activity.id" class="clickable-item">
                            <div class="flex align-center justify-between"
                                :class="{ late: isLateActivity(activity, date) }" @click="modifyActivity(activity)">
                                <h5 :class="{ done: activity.done }">{{ activity.title }}</h5>
                                <button v-if="!activity.done" @click="markAsDone(activity)" @click.stop><v-icon
                                        name="md-done"></v-icon></button>
                                <button v-else @click="undoActivity(activity)" @click.stop><v-icon
                                        name="fa-undo"></v-icon></button>
                            </div>
                        </li>
                    </ul>
                    <p v-if="activitiesForTheDay(date).length === 0">No activities</p>
                </div>
                <div v-if="includeUnavailable" class="mb-2">
                    <h4 class="font-bold">Unavailabilities</h4>
                    <ul>
                        <li v-for="unav in unavailabiltiesForTheDay(date)" :key="unav.id" class="clickable-item">
                            <div class="flex align-center justify-between" @click="modifyUnavailability(unav[0])">
                                <h5>{{ unav[0].title }}</h5>
                                <p>{{ unav[1] }}</p>
                            </div>
                        </li>
                    </ul>
                    <p v-if="unavailabiltiesForTheDay(date).length === 0">Always available</p>
                </div>
            </div>
            <div v-else class="m-8 grid-item empty-cell"></div>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import timeMethods from '../../services/timeService';
import { CalendarEvent } from '@/models/Event';
import { Unavailability } from '@/models/Unavailability';
import { Activity } from '@/models/Activity';
import { useDateStore } from '@/stores/dateStore';
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
        allActivities: {
            type: Array,
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
            dateStore: useDateStore()
        };
    },
    methods: {
        eventsForDay(date: Date): any[] {
            const res = this.filterAndSortForDay(this.allEvents, date);
            return res;
        },
        formatEventTime(event: { event: any, dates: { start: Date, end: Date } }, date: Date): string {
            let startOfDay: Date = timeMethods.getStartOfDay(date);
            let endOfDay: Date = timeMethods.getEndOfDay(date);

            let eventStart = event.dates.start;
            let eventEnd = event.dates.end;

            let start = eventStart <= startOfDay ? startOfDay : eventStart;
            let end = eventEnd >= endOfDay ? endOfDay : eventEnd;

            if (start === startOfDay && endOfDay.getTime() - end.getTime() < 1000)
                return "All day";
            else
                return `${start.getHours().toString()}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString()}:${end.getMinutes().toString().padStart(2, '0')}`;
        },
        modifyEvent(event: any) {
            this.$emit('modifyEvent', event);
        },
        activitiesForTheDay(date: Date): any[] {
            const startOfDay = timeMethods.getStartOfDay(date);
            if (this.allActivities) {
                return this.allActivities.filter((activity: any) => {
                    return timeMethods.sameDate(activity.deadline, date) || 
                        (!activity.done && activity.deadline < startOfDay && startOfDay < timeMethods.getEndOfDay(this.today));
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
            let inRange = withDates.filter((event: any) => {
                return event.dates.start <= endOfDay && event.dates.end >= startOfDay;
            });

            // remove repetitions that are not valid
            let valid = inRange.filter((event: any) => {
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
            if (event.repetition.frequency === 'never' || event.start > timeMethods.getEndOfDay(referenceDate))
                return { start: event.start, end: event.end };

            let nextRepetition = new Date();
            let nextRepetitionEnd = new Date();

            if (event.repetition.frequency == 'daily') {
                nextRepetition = new Date(referenceDate);
            }
            else if (event.repetition.frequency == 'weekly') {
                let distanceFromStart = timeMethods.dayDifference(referenceDate, event.start);
                let previousRepetition = timeMethods.moveAheadByDays(event.start, distanceFromStart - distanceFromStart % 7);

                if (distanceFromStart % 7 <= timeMethods.dayDifference(event.end, event.start))
                    nextRepetition = previousRepetition;
                else
                    nextRepetition = timeMethods.moveAheadByDays(previousRepetition, 7);
            }
            else if (event.repetition.frequency == 'monthly') {
                let distanceFromStart = timeMethods.monthDifference(referenceDate, event.start);
                let previousRepetition = timeMethods.moveAheadByMonths(event.start, distanceFromStart);

                if (previousRepetition.getDate() > referenceDate.getDate())
                    previousRepetition = timeMethods.moveAheadByMonths(event.start, distanceFromStart - 1);

                if (timeMethods.dayDifference(referenceDate, previousRepetition) <= timeMethods.dayDifference(event.end, event.start))
                    nextRepetition = previousRepetition;
                else
                    nextRepetition = timeMethods.moveAheadByMonths(previousRepetition, 1);
            }
            else if (event.repetition.frequency == 'yearly') {
                let distanceFromStart = timeMethods.yearDifference(referenceDate, event.start);
                let previousRepetition = timeMethods.moveAheadByYears(event.start, distanceFromStart);

                if (previousRepetition > referenceDate)
                    previousRepetition = timeMethods.moveAheadByYears(event.start, distanceFromStart - 1);

                if (timeMethods.dayDifference(referenceDate, previousRepetition) <= timeMethods.dayDifference(event.end, event.start))
                    nextRepetition = previousRepetition;
                else
                    nextRepetition = timeMethods.moveAheadByYears(previousRepetition, 1);
            }
            else {
                nextRepetition = new Date(event.start);
            }

            // set times and compute end date
            nextRepetition.setHours(event.start.getHours());
            nextRepetition.setMinutes(event.start.getMinutes());

            const offset = event.end.getTime() - event.start.getTime();
            nextRepetitionEnd.setTime(nextRepetition.getTime() + offset);

            return { start: nextRepetition, end: nextRepetitionEnd };
        },
        // this assumes that the provided dates were obtained from the getNextRepetition method
        isValidRepetition(event: any, repStart: Date, repEnd: Date): boolean {
            if (event.repetition.frequency === 'never' || event.repetition.until === 'infinity')
                return true;
            else if (event.repetition.until === 'date' && repEnd <= timeMethods.getEndOfDay(event.repetition.endDate))
                return true;
            else if (event.repetition.until === 'n-reps') {
                if (event.repetition.frequency === 'daily')
                    return timeMethods.dayDifference(repStart, event.start) < event.repetition.numberOfRepetitions;
                else if (event.repetition.frequency === 'weekly')
                    return timeMethods.dayDifference(repStart, event.start) / 7 < event.repetition.numberOfRepetitions;
                else if (event.repetition.frequency === 'monthly')
                    return timeMethods.monthDifference(repStart, event.start) < event.repetition.numberOfRepetitions;
                else if (event.repetition.frequency === 'yearly')
                    return timeMethods.yearDifference(repStart, event.start) < event.repetition.numberOfRepetitions;
                else
                    return false;
            }
            else
                return false;
        },
        isLateActivity(activity: Activity, date: Date): boolean {
            const startOfDay = timeMethods.getStartOfDay(date);
            return !activity.done && activity.deadline < startOfDay && startOfDay < timeMethods.getEndOfDay(this.today);
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

                const monthDates = [];
                const currentDateOfMonth = new Date(startOfMonth);
                while (currentDateOfMonth <= endOfMonth) {
                    monthDates.push(new Date(currentDateOfMonth));
                    currentDateOfMonth.setDate(currentDateOfMonth.getDate() + 1);
                }
                return monthDates;
            } else {
                return [];
            }
        },
        datesToDisplayWithPlaceholders(): any[] {
            const dates = this.datesToDisplay;
            const datesWithPlaceholders = [];
            for (let i = 0; i < dates.length; i++) {
                datesWithPlaceholders.push(dates[i]);
                if ((i + 1) % 7 === 0) {
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

.late {
    color: red;
}
</style>