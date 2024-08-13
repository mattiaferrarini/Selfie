/*
text content
title 
category
creation date
last modified date 
can view user list
can modified user list
list item ??
*/

import { model, Schema, Document } from 'mongoose'
import User from './User'

export interface INote extends Document {
    content:    string;
    title:      string;
    creation: Date;
    lastmodify: Date;
    category:   string;
    owners:     string[];
}

const NoteSchema: Schema = new Schema<INote>({
    content: {
        type: String
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    creation: {
        type: Date,
        required: true
    },
    lastmodify: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    owners: {
        type: [String],
        required: true,
        validate: {
            validator: (v: string[]) => {
                for (const username in v) {
                    const user = User.findOne({ username: username })
                    if (!user) {
                        return false
                    }
                }
            },
            message: 'at least one user is not valid'
        }
    }
});


export default model('Note', NoteSchema);