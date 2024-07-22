import {Document, model, Schema} from 'mongoose';
import bcrypt from "bcryptjs";

export interface IPushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    real_name: string;
    birthday: Date;
    pushSubscriptions: IPushSubscription[];
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

const PushSubscriptionSchema: Schema = new Schema<IPushSubscription>({
    endpoint: {type: String, required: true},
    keys: {
        p256dh: {type: String, required: true},
        auth: {type: String, required: true},
    }
});

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
    pushSubscriptions: [PushSubscriptionSchema],
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

const User = model<IUser>("User", UserSchema);

export default User;