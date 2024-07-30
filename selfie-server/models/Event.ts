import { model, Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IEvent extends Document {
    title: string;
    start: Date;
    end: Date;
    repetition: {
        frequency: string;
        numberOfRepetitions: number;
        endDate: Date;
    };
    place: string;
    notification: {
        method: string;
        when: string;
        repeat: string;
    };
    participants: IUser[];
}

const EventSchema: Schema = new Schema<IEvent>({
    title: {
        type: String,
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    repetition: {
        frequency: {
            type: String,
        },
        numberOfRepetitions: {
            type: Number
        },
        endDate: {
            type: Date
        }
    },
    place: {
        type: String
    },
    notification: {
        method: {
            type: [String], // Changed to an array of strings
            // required: true
        },
        when: {
            type: String,
            // enum: ['all\'ora voluta', 'un minuto', 'cinque minuti', 'un\'ora', 'due ore', 'un giorno', 'due giorni prima'],
            required: function() {
                return this.notification.method != null;
            }
        },
        repeat: {
            type: String,
            // enum: ['ripeti tre volte', 'ripeti ogni minuto', 'ripeti ogni ora', 'ripeti fino a che non rispondo', 'ecc.'],
            required: function() {
                return this.notification.method != null;
            }
        }
    },
    participants: [{
        username: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        }
    }]
});

export default model<IEvent>('Event', EventSchema);