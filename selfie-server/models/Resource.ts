import { model, Schema, Document } from 'mongoose';

export interface IResource extends Document {
    name: string;
    username: string;
}

const ResourceSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true }
});

export default model<IResource>('Resource', ResourceSchema);