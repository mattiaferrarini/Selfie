import {Document, model, Schema} from 'mongoose';
import bcrypt from "bcryptjs";

export interface IPushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

enum NotificationType {
    EMAIL = "email",
    PUSH = "push",
    BOTH = "both"
}

enum PomodoroType {
    SETTINGS = "settings",
    STATS = "stats"
}

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    realName: string;
    birthday: Date;
    pushSubscriptions: IPushSubscription[];
    preferences: {
        home: {
            calendarWeekly: boolean;
            notesDescription: boolean;
            pomodoroType: PomodoroType;
        };
        notificationType: NotificationType;
        notes: Object; // Adjust the type based on your requirements
        pomodoro: {
            workDuration: number;
            pauseDuration: number;
            numberOfCycles: number;
        };
    };
}

const PushSubscriptionSchema: Schema = new Schema<IPushSubscription>({
    endpoint: {type: String},
    keys: {
        p256dh: {type: String},
        auth: {type: String},
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
        unique: true,
        match: /.+@.+\..+/ // Simple email validation
    },
    password: {
        type: String,
        required: true
    },
    realName: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        required: true
    },
    pushSubscriptions: {
        type: [PushSubscriptionSchema],
        default: []
    },
    preferences: {
        home: {
            calendarWeekly: {
                type: Boolean,
                required: true
            },
            notesDescription: {
                type: Boolean,
                required: true
            },
            pomodoroType: {
                type: String,
                required: true,
                enum: ['settings', 'stats']
            }
        },
        notificationType: {
            type: String,
            enum: Object.values(NotificationType),
            required: true
        },
        notes: {
            type: Object,
            required: false
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