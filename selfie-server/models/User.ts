import { model, Schema, Document } from 'mongoose';
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    real_name: string;
    birthday: Date;
}

const UserSchema: Schema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    real_name: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        required: true
    }
});


// before save always hash the password
UserSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export default model('User', UserSchema);