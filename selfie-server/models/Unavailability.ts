import { model, Schema, Document } from 'mongoose';

interface IUnavailability extends Document {
    title: string;
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
    username: string;
}

const UnavailabilitySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    allDay: {
        type: Boolean,
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
    timezone: {
        type: String,
        required: true,
        default: 'UTC'
    },
    repetition: {
        frequency: {
            type: String,
            required: true
        },
        until: {
            type: String,
            required: true
        },
        numberOfRepetitions: {
            type: Number,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        }
    },
    username: {
        type: String,
        required: true
    }
});

const Unavailability = model<IUnavailability>('Unavailability', UnavailabilitySchema);
export default Unavailability;