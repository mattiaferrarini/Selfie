import {Document, model, Schema} from "mongoose";

enum ActivityStatus {
    NonAttivabile = 'Non attivabile',   // non è ancora disponibile l'input relativo
    Attivabile = 'Attivabile',          //  l'input è presente ma l'attore non ha ancora dichiarato di averla iniziata
    Attiva = 'Attiva',                  // l'attore ha dichiarato di averla iniziata
    Conclusa = 'Conclusa',              // l'attore ha dichiarato di averla conclusa ed un output è disponbile
    Riattivata = 'Riattivata',          // il capo-progetto ha rifiutato l'output e ha richiesto revisioni
    InRitardo = 'In ritardo',           // la data di conclusione è passata ma l'output non è ancora disponibile
    Abbandonata = 'Abbandonata'         // la data di conclusione è passata da molto tempo, oppure l'attore ha dichiarato di non volersene più occupare
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
                        enum: ['Non attivabile', 'Attivabile', 'Attiva', 'Conclusa', 'Riattivata', 'In ritardo', 'Abbandonata']
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