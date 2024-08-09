import { model, Schema, Document } from 'mongoose';

export interface IEvent extends Document {
    title: string;
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
    participants:{
        username: string;
        email: string;
        status: string;
    }[];
}

const EventSchema = new Schema({
    title: { type: String, required: true },
    allDay: { type: Boolean, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    repetition: {
        frequency: { type: String, required: true },
        until: { type: String, required: true },
        numberOfRepetitions: { type: Number, required: true },
        endDate: { type: Date, required: true }
    },
    location: { type: String },
    notification: {
        method: { type: [String], required: true },
        when: { type: String, required: true },
        repeat: { type: String, required: true }
    },
    participants: [{
        username: { type: String, required: true },
        email: { type: String, required: false },
        status: { type: String, required: true }
    }]
});

export default model<IEvent>('Event', EventSchema);