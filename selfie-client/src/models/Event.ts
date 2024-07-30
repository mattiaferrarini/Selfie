export class CalendarEvent {
    title: string;
    allDay: boolean;
    start: Date;
    end: Date;
    repetition: {
        frequency: string;
        until: string;
        numberOfRepetitions: number;
        endDate: Date;
    };
    notification: {
        method: string[];
        when: string;
        repeat: string;
    };
    participants: {
        username: string;
        status: string;
    }[];

    constructor(
        title = '',
        allDay = false,
        start: Date = new Date(),
        end: Date = new Date(),
        repetition: {
            frequency: string;
            until: string;
            numberOfRepetitions: number;
            endDate: Date;
        } = {
            frequency: 'never',
            until: 'infinity',
            numberOfRepetitions: 0,
            endDate: new Date()
        },
        notification: {
            method: string[];
            when: string;
            repeat: string;
        } = {
            method: [],
            when: 'atEvent',
            repeat: 'never'
        },
        participants: {
            username: string;
            status: string;
        }[] = []
    ) {
        this.title = title;
        this.allDay = allDay;
        this.start = start;
        this.end = end;
        this.repetition = repetition;
        this.notification = notification;
        this.participants = participants;
    }
}