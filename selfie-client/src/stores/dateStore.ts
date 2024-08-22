import {defineStore} from 'pinia';

export const useDateStore = defineStore('date', {
    state: () => ({
        currentDate: new Date(),
        timeDiff: 0,
    }),
    actions: {
        setCurrentDate(date: Date) {
            this.currentDate = new Date(date);
        },
        setTimeDiff(millisecondsDiff: number) {
            this.timeDiff = millisecondsDiff;
        },
        getCurrentDate(): Date {
            return this.currentDate;
        },
    },
});