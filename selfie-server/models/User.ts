import {Document, model, Schema} from 'mongoose';
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    real_name: string;
    birthday: Date;
    preferences: {
        homeView: Object; // Adjust the type based on your requirements
        notes: Object; // Adjust the type based on your requirements
        pomodoro: {
            workDuration: number;
            pauseDuration: number;
            numberOfCycles: number;
        };
    };
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
    },
    preferences: {
        homeView: {
            type: Object, // Or any other type based on your requirements
            required: false // Adjust based on whether this is optional or required
        },
        notes: {
            type: Object, // Or any other type based on your requirements
            required: false // Adjust based on whether this is optional or required
        },
        pomodoro: {
            workDuration: {
                type: Number,
                required: true
            },
            pauseDuration: {
                type: Number,
                required: true
            },
            numberOfCycles: {
                type: Number,
                required: true
            }
        }
    }
});


// before save always hash the password
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export default model('User', UserSchema);