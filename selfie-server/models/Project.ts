import {Document, model, Schema} from "mongoose";

export interface IProject extends Document {
    owner: string;
    actors: string[];
    title: string;
    phases: [{
        title: string;
        activities: [{
            isMilestone: boolean;
            status: string;
            activityId: string;
            linkedActivityId: string;
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
                        enum: ['Not started', 'In progress', 'Completed']
                    },
                    activityId: {
                        type: String,
                        required: true
                    },
                    linkedActivityId: {
                        type: String,
                        required: false
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