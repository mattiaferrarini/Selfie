export class Unavailability {
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
    username: string;

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
        username = ''
    ) {
        this.title = title;
        this.allDay = allDay;
        this.start = start;
        this.end = end;
        this.repetition = repetition;
        this.username = username;
    }
}