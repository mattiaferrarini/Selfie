import {Document, model, Schema} from 'mongoose';

export interface IMessage extends Document {
    text: string;
    senderUsername: string;
    receiverUsername: string;
    createdAt: Date;
}

const MessageSchema: Schema = new Schema<IMessage>({
    text: {type: String, required: true},
    senderUsername: {type: String, required: true},
    receiverUsername: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default model('Message', MessageSchema);