import { model, Schema, Document } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    owner: string;
    allDay: boolean;
    start: Date;
    end: Date;
    timezone: string;
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
    participants: {
        username: string;
        email: string;
        status: string;
    }[];
}

const EventSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    owner: { 
        type: String, 
        required: false 
    },
    allDay: { 
        type: Boolean, 
        required: true, 
        default: false 
    },
    start: { 
        type: Date, 
        required: true,
        default: Date.now 
    },
    end: { 
        type: Date, 
        required: true,
        default: Date.now 
    },
    timezone: { 
        type: String, 
        required: true,
        default: 'UTC' 
    },
    repetition: {
        frequency: { 
            type: String, 
            required: true,
            default: 'never' 
        },
        until: { 
            type: String, 
            required: true,
            default: 'infinity' 
        },
        numberOfRepetitions: { 
            type: Number, 
            required: true,
            default: 1 
        },
        endDate: { 
            type: Date, 
            required: true,
            default: Date.now 
        }
    },
    location: { 
        type: String 
    },
    notification: {
        method: { 
            type: [String], 
            required: true,
            default: [],
            enum: ['push', 'email']
        },
        when: { 
            type: String, 
            required: true,
            default: 'atEvent' 
        },
        repeat: { 
            type: String, 
            required: true,
            default: 'never' 
        }
    },
    participants: [{
        username: { type: String, required: true },
        email: { type: String, required: false },
        status: { type: String, required: true }
    }]
});

const Event = model<IEvent>('Event', EventSchema);
export default Event;