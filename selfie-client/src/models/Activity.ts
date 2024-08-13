export class Activity {
    title: string;
    id: string | undefined;
    done: boolean;
    deadline: Date;
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
    subActivitiesIDs: string[];
    pomodoro: null | undefined | {
        cycles: number;
        completedCycles: number;
    };

    constructor(
        title = '',
        done = false,
        deadline: Date = new Date(),
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
        }[] = [],
        subActivitiesIDs = [],
        pomodoro = null
    ) {
        this.title = title;
        this.done = done;
        this.deadline = deadline;
        this.notification = notification;
        this.participants = participants;
        this.subActivitiesIDs = subActivitiesIDs;
        this.pomodoro = pomodoro;
    }
}