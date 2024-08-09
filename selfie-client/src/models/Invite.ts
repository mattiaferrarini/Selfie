export class Invite{
    id: string | undefined;
    inviteeUsername: string;
    eventId: string | undefined;
    activityId: string | undefined;
    answerDate: Date;
    
    constructor(
        inviteeUsername = '',
        answerDate: Date = new Date(),
        eventId: string | undefined = undefined,
        activityId: string | undefined = undefined
    ) {
        this.inviteeUsername = inviteeUsername;
        this.answerDate = answerDate;
        this.eventId = eventId;
        this.activityId = activityId;
    }
}