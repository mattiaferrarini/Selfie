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

export interface INote extends Document {
    content:    string;
    title:      string;
    creation: Date;
    lastmodify: Date;
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
    }
});


export default model('Note', NoteSchema);