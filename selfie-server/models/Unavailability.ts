import { model, Schema, Document } from 'mongoose';

interface IUnavailability extends Document {
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

export default model<IUnavailability>('Unavailability', UnavailabilitySchema);