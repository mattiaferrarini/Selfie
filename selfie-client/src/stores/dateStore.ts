import {defineStore} from 'pinia';

//TODO: remove unused methods
class CustomDate {
    private date: Date;

    constructor(date: string | number | Date) {
        this.date = new Date(date);
    }

    addDays(days: number): CustomDate {
        this.date.setDate(this.date.getDate() + days);
        return this;
    }

    removeDays(days: number): CustomDate {
        this.date.setDate(this.date.getDate() - days);
        return this;
    }

    setDate(date: Date): CustomDate {
        this.date = date;
        return this;
    }

    // Getter to expose the date
    getDate(): Date {
        return this.date;
    }
}

//TODO: decide if to use class or simple date
export const useDateStore = defineStore('date', {
    state: () => ({
        currentDate: new Date(),
    }),
    actions: {
        /*addDaysToCurrentDate(days: number) {
            this.currentDate.addDays(days);
        },
        removeDaysFromCurrentDate(days: number) {
            this.currentDate.removeDays(days);
        },*/
        setCurrentDate(date: Date) {
            //this.currentDate.setDate(date);
            this.currentDate = date;
        },
        getCurrentDate(): Date {
            //return this.currentDate.getDate();
            return this.currentDate;
        },
    },
});