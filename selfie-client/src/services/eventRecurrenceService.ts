import timeService from "./timeService";

const getNextRepetition = (event: any, referenceDate: Date): { start: Date, end: Date } => {
    if (event.repetition.frequency === 'never' || event.start > timeService.getEndOfDay(referenceDate))
        return { start: event.start, end: event.end };

    let nextRepetition = new Date();
    const nextRepetitionEnd = new Date();

    if (event.repetition.frequency == 'daily') {
        nextRepetition = new Date(referenceDate);
    }
    else if (event.repetition.frequency == 'weekly') {
        const distanceFromStart = timeService.dayDifference(referenceDate, event.start);
        const previousRepetition = timeService.moveAheadByDays(event.start, distanceFromStart - distanceFromStart % 7);

        if (distanceFromStart % 7 <= timeService.dayDifference(event.end, event.start))
            nextRepetition = previousRepetition;
        else
            nextRepetition = timeService.moveAheadByDays(previousRepetition, 7);
    }
    else if (event.repetition.frequency == 'monthly') {
        const distanceFromStart = timeService.monthDifference(referenceDate, event.start);
        let previousRepetition = timeService.moveAheadByMonths(event.start, distanceFromStart);

        if (previousRepetition.getDate() > referenceDate.getDate())
            previousRepetition = timeService.moveAheadByMonths(event.start, distanceFromStart - 1);

        if (timeService.dayDifference(referenceDate, previousRepetition) <= timeService.dayDifference(event.end, event.start))
            nextRepetition = previousRepetition;
        else
            nextRepetition = timeService.moveAheadByMonths(previousRepetition, 1);
    }
    else if (event.repetition.frequency == 'yearly') {
        const distanceFromStart = timeService.yearDifference(referenceDate, event.start);
        let previousRepetition = timeService.moveAheadByYears(event.start, distanceFromStart);

        if (previousRepetition > referenceDate)
            previousRepetition = timeService.moveAheadByYears(event.start, distanceFromStart - 1);

        if (timeService.dayDifference(referenceDate, previousRepetition) <= timeService.dayDifference(event.end, event.start))
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

    return { start: nextRepetition, end: nextRepetitionEnd };
}

const isValidRepetition = (event: any, repStart: Date, repEnd: Date): boolean => {
    if (event.repetition.frequency === 'never' || event.repetition.until === 'infinity')
        return true;
    else if (event.repetition.until === 'date' && repEnd <= timeService.getEndOfDay(event.repetition.endDate))
        return true;
    else if (event.repetition.until === 'n-reps') {
        if (event.repetition.frequency === 'daily')
            return timeService.dayDifference(repStart, event.start) < event.repetition.numberOfRepetitions;
        else if (event.repetition.frequency === 'weekly')
            return timeService.dayDifference(repStart, event.start) / 7 < event.repetition.numberOfRepetitions;
        else if (event.repetition.frequency === 'monthly')
            return timeService.monthDifference(repStart, event.start) < event.repetition.numberOfRepetitions;
        else if (event.repetition.frequency === 'yearly')
            return timeService.yearDifference(repStart, event.start) < event.repetition.numberOfRepetitions;
        else
            return false;
    }
    else
        return false;
}

export default {
    getNextRepetition,
    isValidRepetition
}