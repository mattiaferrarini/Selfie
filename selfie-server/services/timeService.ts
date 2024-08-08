const getStartOfDay = (date: Date): Date => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
}

const getEndOfDay = (date: Date): Date => {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 0, 0);
    return endOfDay;
}

const dayDifference = (date1: Date, date2: Date): number => {
    const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
    const time1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()).getTime();
    const time2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()).getTime();
    const diffDays = Math.round(Math.abs((time1 - time2) / oneDay));
    return diffDays;
}

const monthDifference = (endDate: Date, startDate: Date): number => {
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();

    return (endYear - startYear) * 12 + (endMonth - startMonth);
}

const yearDifference = (endDate: Date, startDate: Date): number => {
    return endDate.getFullYear() - startDate.getFullYear();
}

const moveAheadByHours = (date: Date, hours: number): Date => {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

const moveAheadByDays = (date: Date, days: number): Date => {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

const moveAheadByMonths = (date: Date, months: number): Date => {
    let new_month = date.getMonth() + months;
    const new_year = date.getFullYear() + Math.floor(new_month / 12);
    new_month = new_month % 12;

    return cropDate(new_year, new_month, date.getDate());
}

const moveAheadByYears = (date: Date, years: number): Date => {
    if(date.getMonth() === 1 && date.getDate() === 29 && getDaysInMonth(date.getFullYear() + years, 1) === 28)
        return new Date(date.getFullYear() + years, date.getMonth(), 28);
    else
        return new Date(date.getFullYear() + years, date.getMonth(), date.getDate());
}

const cropDate = (year: number, month: number, day: number): Date =>{
    const daysInMonth = getDaysInMonth(year, month);
    return new Date(year, month, Math.min(day, daysInMonth));
}

const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
}

const overlap = (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
    return start1 <= end2 && end1 >= start2;
}

export default {
    getStartOfDay,
    getEndOfDay,
    dayDifference,
    monthDifference,
    yearDifference,
    moveAheadByHours,
    moveAheadByDays,
    moveAheadByMonths,
    moveAheadByYears,
    overlap
};