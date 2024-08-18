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

enum CalendarContent {
    ALL = "all",
    EVENTS = "events",
    ACTIVITIES = "activities"
}

enum PomodoroType {
    SETTINGS = "settings",
    STATS = "stats"
}

enum ProjectsView {
    LIST = "list",
    GANTT = "gantt"
}

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    isAdmin: boolean;
    realName: string;
    birthday: Date;
    pushSubscriptions: IPushSubscription[];
    preferences: {
        home: {
            calendarWeekly: boolean;
            calendarContent: CalendarContent;
            notesDescription: boolean;
            pomodoroType: PomodoroType;
        };
        notificationType: NotificationType;
        notes: Object;
        pomodoro: {
            workDuration: number;
            pauseDuration: number;
            numberOfCycles: number;
        };
        projectsView: ProjectsView;
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
        unique: true,
        match: /^[a-zA-Z0-9_]*$/ // Only letters, numbers and underscores
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
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
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
            calendarContent: {
                type: String,
                required: true,
                enum: ['all', 'events', 'activities'],
                default: 'all'
            },
            notesDescription: {
                type: Boolean,
                required: true
            },
            pomodoroType: {
                type: String,
                required: true,
                enum: ['settings', 'stats'],
                default: 'stats'
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
        },
        projectsView: {
            type: String,
            required: true,
            default: 'list',
            enum: ['list', 'gantt']
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