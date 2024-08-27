import {Document, model, Schema} from "mongoose";

export enum ActivityStatus {
    NotStarted = 'NotStarted',
    Started = 'Started',
    Concluded = 'Concluded',
    Rejected = 'Rejected',
    Abandoned = 'Abandoned'
}

export interface IProject extends Document {
    owner: string;
    actors: string[];
    title: string;
    phases: [{
        title: string;
        activities: [{
            isMilestone: boolean;
            status: ActivityStatus;
            activityId: string;
            linkedActivityId: number;
            localId: number;
            input: string;
            output: string;
        }]
    }]
}

const ProjectSchema = new Schema({
    owner: {
        type: String,
        required: true
    },
    actors: {
        type: [String],
    },
    title: {
        type: String,
        required: true
    },
    phases: {
        type: [{
            title: {
                type: String,
                required: true
            },
            activities: {
                type: [{
                    isMilestone: {
                        type: Boolean,
                        required: true
                    },
                    status: {
                        type: String,
                        required: true,
                        enum: ['NotStarted', 'Started', 'Concluded', 'Rejected', 'Abandoned']
                    },
                    activityId: {
                        type: String,
                        required: true
                    },
                    linkedActivityId: {
                        type: Number,
                        required: false
                    },
                    localId: {
                        type: Number,
                        required: true
                    },
                    input: {
                        type: String,
                        required: false
                    },
                    output: {
                        type: String,
                        required: false
                    },
                }]
            }
        }]
    }
});

const Project = model<IProject>('Project', ProjectSchema);
export default Project;