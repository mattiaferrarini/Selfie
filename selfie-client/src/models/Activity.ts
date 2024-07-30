export class Activity {
    title: string;
    done: boolean;
    deadline: Date;
    notification: {
        method: string[];
        when: string;
        repeat: string;
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
        }
    ) {
        this.title = title;
        this.done = done;
        this.deadline = deadline;
        this.notification = notification;
    }
}