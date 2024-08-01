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
        id: string;
        status: string;
    }[];

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
        participants = []
    ) {
        this.title = title;
        this.done = done;
        this.deadline = deadline;
        this.notification = notification;
        this.participants = participants;
    }
}