const getFirstDayOfWeek = (date: Date): Date => {
    const currentDay = date.getDay();
    const offsetFromStartOfWeek = currentDay === 0 ? 6 : currentDay - 1;
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - offsetFromStartOfWeek);
    return startOfWeek;
};

const getLastDayOfWeek = (date: Date): Date => {
    const currentDay = date.getDay();
    const offsetFromEndOfWeek = currentDay === 0 ? 0 : 7 - currentDay;
    const endOfWeek = new Date(date);
    endOfWeek.setDate(date.getDate() + offsetFromEndOfWeek);
    return endOfWeek;
};

const getFirstDayOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getLastDayOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const formatDayMonth = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
};

const getStartOfCurrentPeriod = (date: Date, view: string): Date => {
    if (view === 'day') {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        return startOfDay;
    } else if (view === 'week') {
        const startOfWeek = getFirstDayOfWeek(new Date(date));
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    } else {
        const startOfMonth = getFirstDayOfMonth(new Date(date));
        startOfMonth.setHours(0, 0, 0, 0);
        return startOfMonth;
    }
};

const getEndOfCurrentPeriod = (date: Date, view: string): Date => {
    if (view === 'day') {
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 0, 0);
        return endOfDay;
    } else if (view === 'week') {
        const endOfWeek = getLastDayOfWeek(new Date(date));
        endOfWeek.setHours(23, 59, 0, 0);
        return endOfWeek;
    } else {
        const endOfMonth = getLastDayOfMonth(new Date(date));
        endOfMonth.setHours(23, 59, 0, 0);
        return endOfMonth;
    }
};

const getNormalizedDayOfWeek = (date: Date): number => {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
}

const getDayOfWeek = (date: Date): string => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return daysOfWeek[date.getDay()];
};

const isWeekend = (date: Date): boolean => {
    return date.getDay() === 0 || date.getDay() === 6;
};

const getStartOfDay = (date: Date): Date => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
};

const getEndOfDay = (date: Date): Date => {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 0, 0);
    return endOfDay;
};

const sameDate = (date1: Date, date2: Date): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toDateString() === d2.toDateString();
};

const prevCurrentDate = (currentDate: Date, view: string): Date => {
    let newDate: Date;
    if (view === 'day') {
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
    } else if (view === 'week') {
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);
    } else {
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    }
    return newDate;
};

const nextCurrentDate = (currentDate: Date, view: string): Date => {
    let newDate: Date;
    if (view === 'day') {
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    } else if (view === 'week') {
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7);
    } else {
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
    return newDate;
};

const roundTime = (date: Date): Date => {
    let minutes = Math.round(date.getMinutes() / 5) * 5;
    let hours = date.getHours();
    hours = minutes === 60 ? hours + 1 : hours;
    minutes = minutes === 60 ? 0 : minutes;

    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
};

const moveAheadByHours = (date: Date, hours: number): Date => {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
};

const moveAheadByDays = (date: Date, days: number): Date => {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
};

const moveAheadByMonths = (date: Date, months: number): Date => {
    let new_month = date.getMonth() + months;
    const new_year = date.getFullYear() + Math.floor(new_month / 12);
    new_month = new_month % 12;

    return cropDate(new_year, new_month, date.getDate());
};

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

const formatPeriodString = (currentDate: Date, view: string): string => {
    if (view === 'day') {
        return formatDayMonth(currentDate);
    }
    else if (view === 'week') {
        const firstDay = getFirstDayOfWeek(currentDate);
        const lastDay = getLastDayOfWeek(currentDate);
        return `${formatDayMonth(firstDay)} - ${formatDayMonth(lastDay)}`;
    }
    else {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const month = months[currentDate.getMonth()];
        const year = currentDate.getFullYear();
        return `${month} ${year}`;
    }
};

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

export default {
    getFirstDayOfWeek,
    getLastDayOfWeek,
    getFirstDayOfMonth,
    getLastDayOfMonth,
    formatDayMonth,
    getStartOfCurrentPeriod,
    getEndOfCurrentPeriod,
    getDayOfWeek,
    isWeekend,
    getStartOfDay,
    getEndOfDay,
    sameDate,
    prevCurrentDate,
    nextCurrentDate,
    roundTime,
    moveAheadByHours,
    moveAheadByDays,
    moveAheadByYears,
    formatPeriodString,
    dayDifference,
    monthDifference,
    getNormalizedDayOfWeek,
    cropDate,
    moveAheadByMonths,
    yearDifference
};