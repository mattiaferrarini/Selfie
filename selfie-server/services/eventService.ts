import timeService from "./timeService";
import Event from "../models/Event";

const eventInRange = (event:any, start:Date, end:Date): boolean => {
    // the event representing the selected period of time
    const periodEvent = new Event();
    periodEvent.start = new Date(start);
    periodEvent.end = new Date(end);

    return eventsOverlap(event, periodEvent);
}

const eventsOverlap = (event1: any, event2: any) => {
    if(event1.repetition.frequency === 'never')
        return noRepOverlap(event1, event2);
    else if(event2.repetition.frequency === 'never')
        return noRepOverlap(event2, event1);
    else if(event1.repetition.frequency === 'daily')
        return dailyOverlap(event1, event2);
    else if(event2.repetition.frequency === 'daily')
        return dailyOverlap(event2, event1);
    else if(event1.repetition.frequency === 'weekly')
        return weeklyOverlap(event1, event2);
    else if(event2.repetition.frequency === 'weekly')
        return weeklyOverlap(event2, event1);
    else if(event1.repetition.frequency === 'monthly')
        return monthlyOverlap(event1, event2);
    else if(event2.repetition.frequency === 'monthly')
        return monthlyOverlap(event2, event1);
    else
        return yearlyOverlap(event1, event2);
}

// event1 must have no repetitions
const noRepOverlap = (event1: any, event2: any) => {
    return firstRepetitionOverlap(event1, event2);
}

// event1 must have daily repetition and event2 must have repetition frequency >= daily
const dailyOverlap = (event1: any, event2: any) => {
    return firstRepetitionOverlap(event1, event2);
}

// event1 must have weekly repetition and event2 must have repetition frequency >= weekly
const weeklyOverlap = (event1: any, event2: any) => {
    if(event2.repetition.frequency === 'weekly')
        return firstRepetitionOverlap(event1, event2);
    else{
        // handle change of day of week for events with monthly and yearly repetition
        // approximate the solution by checking the next 12 repetitions
        return overlapInNextRepetitions(event1, event2, 12);
    }
}

// event1 must have monthly repetition and event2 must have repetition frequency >= monthly
const monthlyOverlap = (event1: any, event2: any) => {
    if(event2.repetition.frequency === 'yearly')
        return firstRepetitionOverlap(event1, event2);
    else {
        if(event1.start.getDate() <= event2.end.getDate() && event1.end.getDate() >= event2.start.getDate())
            return firstRepetitionOverlap(event1, event2);
        else if(event1.start.getDate() <= 28  && event1.end.getDate() <= 28 && event2.start.getDate() <= 28 && event2.end.getDate() <= 28)
            return false;
        else{
            // handle case where start and end dates might be dependent on the month length by approximating the solution
            return overlapInNextRepetitions(event1, event2, 12);
        }
    }
}

// both events must have yearly repetition
const yearlyOverlap = (event1: any, event2: any) => {
    return firstRepetitionOverlap(event1, event2);
}

// to check if the first (relative) repetition of event1 overlaps with the first (relative) repetition of event2
// it can be used for cases where to overlap will not happen unless it also happen on the first (relative) repetition
const firstRepetitionOverlap = (event1: any, event2: any) => {
    const { start: nextStart2, end: nextEnd2 } = getNextRepetition(event2, event1.start);

    if(isValidRepetition(event2, nextStart2, nextEnd2)){
        const { start: nextStart1, end: nextEnd1 } = getNextRepetition(event1, nextStart2);

        if(isValidRepetition(event1, nextStart1, nextEnd1))
            return timeService.overlap(nextStart1, nextEnd1, nextStart2, nextEnd2);
        else
            return false;
    }
    else
        return false;
}

// check if an overlap happens in the next maxReps (relative) repetitions of event1 and event2
const overlapInNextRepetitions = (event1: any, event2: any, maxReps: number) => {
    let { start: nextStart2, end: nextEnd2 } = getNextRepetition(event2, event1.start);
    let nextStart1 = new Date(event1.start), nextEnd1 = new Date(event1.end);

    let i = 0;
    while(i < maxReps && isValidRepetition(event1, nextStart1, nextEnd1) && isValidRepetition(event2, nextStart2, nextEnd2)){
        if(timeService.overlap(nextStart1, nextEnd1, nextStart2, nextEnd2))
            return true;
        else{
            let temp = getNextRepetition(event1, nextStart2);
            nextStart1 = temp.start;
            nextEnd1 = temp.end;

            temp = getNextRepetition(event2, nextStart1);
            nextStart2 = temp.start;
            nextEnd2 = temp.end;

            i++;
        }
    }

    return false;
}

// get the next (relative) repetition of an event after a reference date
const getNextRepetition = (event: any, referenceDate: Date): {start: Date, end: Date} => {
    if(event.repetition.frequency === 'never' || event.start > timeService.getEndOfDay(referenceDate))
        return {start: event.start, end: event.end};

    let nextRepetition = new Date();
    let nextRepetitionEnd = new Date();

    if (event.repetition.frequency === 'daily') {
        nextRepetition = new Date(referenceDate);
    } 
    else if (event.repetition.frequency === 'weekly'){
        let distanceFromStart = timeService.dayDifference(referenceDate, event.start);
        let previousRepetition = timeService.moveAheadByDays(event.start, distanceFromStart - distanceFromStart % 7);

        if(distanceFromStart % 7 <= timeService.dayDifference(event.end, event.start))
            nextRepetition = previousRepetition;
        else
            nextRepetition = timeService.moveAheadByDays(previousRepetition, 7);
    }
    else if (event.repetition.frequency === 'monthly') {
        let distanceFromStart = timeService.monthDifference(referenceDate, event.start);
        let previousRepetition = timeService.moveAheadByMonths(event.start, distanceFromStart);

        if(previousRepetition.getDate() > referenceDate.getDate())
            previousRepetition = timeService.moveAheadByMonths(event.start, distanceFromStart - 1);

        if(timeService.dayDifference(referenceDate, previousRepetition) <= timeService.dayDifference(event.end, event.start))
            nextRepetition = previousRepetition;
        else
            nextRepetition = timeService.moveAheadByMonths(previousRepetition, 1);
    }
    else if(event.repetition.frequency === 'yearly'){
        let distanceFromStart = timeService.yearDifference(referenceDate, event.start);
        let previousRepetition = timeService.moveAheadByYears(event.start, distanceFromStart);

        if(previousRepetition > referenceDate)
            previousRepetition = timeService.moveAheadByYears(event.start, distanceFromStart - 1);

        if(timeService.dayDifference(referenceDate, previousRepetition) <= timeService.dayDifference(event.end, event.start))
            nextRepetition = previousRepetition;
        else
            nextRepetition = timeService.moveAheadByYears(previousRepetition, 1);
    }
    else {
        nextRepetition = new Date(event.start);
    }

    // set times and compute end date
    nextRepetition.setHours(event.start.getHours());
    nextRepetition.setMinutes(event.start.getMinutes());

    const offset = event.end.getTime() - event.start.getTime();
    nextRepetitionEnd.setTime(nextRepetition.getTime() + offset);

    return {start: nextRepetition, end: nextRepetitionEnd};
}

// this assumes that the provided dates were obtained from the getNextRepetition method
const isValidRepetition = (event: any, repStart: Date, repEnd: Date) : boolean => {
    if(event.repetition.frequency === 'never' || event.repetition.until === 'infinity')
        return true;
    else if(event.repetition.until === 'date' && repEnd <= timeService.getEndOfDay(event.repetition.endDate))
        return true;
    else if(event.repetition.until === 'n-reps'){
        if(event.repetition.frequency === 'daily')
            return timeService.dayDifference(repStart, event.start) < event.repetition.numberOfRepetitions;
        else if(event.repetition.frequency === 'weekly')
            return timeService.dayDifference(repStart, event.start) / 7 < event.repetition.numberOfRepetitions;
        else if(event.repetition.frequency === 'monthly')
            return timeService.monthDifference(repStart, event.start) < event.repetition.numberOfRepetitions;
        else if(event.repetition.frequency === 'yearly')
            return timeService.yearDifference(repStart, event.start) < event.repetition.numberOfRepetitions;
        else
            return false;
    }
    else
       return false;
}

const getNextValidRepetition = (event: any, referenceDate: Date): {start: Date | null, end: Date | null} => {
    let { start, end } = getNextRepetition(event, referenceDate);

    if(isValidRepetition(event, start, end) && referenceDate < end)
        return {start, end};
    else
        return {start: null, end: null};
}

export default {
    eventsOverlap,
    eventInRange,
    getNextValidRepetition
}