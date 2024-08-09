import { model, Schema, Document } from 'mongoose';
import { IEvent } from './Event';
import { IActivity } from './Activity';

export interface IInvite extends Document {
    inviteeUsername: string;
    eventId: IEvent['_id'];
    activityId: IActivity['_id'];
    answerDate: Date;
}

const InviteSchema = new Schema({
    inviteeUsername: {
        type: String,
        required: true
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
    },
    activityId: {
        type: Schema.Types.ObjectId,
        ref: 'Activity',
    },
    answerDate: {
        type: Date,
        required: true
    }
});

const Invite = model<IInvite>('Invite', InviteSchema);
export default Invite;