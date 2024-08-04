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
        status: string;
    }[];
    subActivitiesIDs: string[];

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
        participants = [],
        subActivitiesIDs = []
    ) {
        this.title = title;
        this.done = done;
        this.deadline = deadline;
        this.notification = notification;
        this.participants = participants;
        this.subActivitiesIDs = subActivitiesIDs;
    }
}