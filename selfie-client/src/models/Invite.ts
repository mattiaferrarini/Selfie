export class Invite{
    id: string | undefined;
    inviters: string[];
    inviteeUsername: string;
    eventId: string | undefined;
    activityId: string | undefined;
    answerDate: Date;
    
    constructor(
        inviters: string[] = [],
        inviteeUsername = '',
        answerDate: Date = new Date(),
        eventId: string | undefined = undefined,
        activityId: string | undefined = undefined
    ) {
        this.inviters = inviters;
        this.inviteeUsername = inviteeUsername;
        this.answerDate = answerDate;
        this.eventId = eventId;
        this.activityId = activityId;
    }
}