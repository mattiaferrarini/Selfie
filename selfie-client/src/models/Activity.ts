export class Activity {
    title: string;
    owner: string | undefined;
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
        options: {
            workDuration: number;
            pauseDuration: number;
            numberOfCycles: number;
        };
        completedCycles: {
            [username: string]: number
        };
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
            repeat: 'daily'
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