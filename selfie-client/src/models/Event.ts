export class CalendarEvent {
    title: string;
    id: string | undefined;
    allDay: boolean;
    start: Date;
    end: Date;
    repetition: {
        frequency: string;
        until: string;
        numberOfRepetitions: number;
        endDate: Date;
    };
    location: string;
    notification: {
        method: string[];
        when: string;
        repeat: string;
    };
    participants: {
        username: string;
        email: string;
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
            numberOfRepetitions: 1,
            endDate: new Date()
        },
        location = '',
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
            email: string;
            status: string;
        }[] = []
    ) {
        this.title = title;
        this.allDay = allDay;
        this.start = start;
        this.end = end;
        this.repetition = repetition;
        this.location = location;
        this.notification = notification;
        this.participants = participants;
    }
}