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

export class Preferences {
    home: {
        calendarWeekly: boolean;
        calendarContent: CalendarContent;
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
    projectsView: ProjectsView;

    constructor(
        home = {
            calendarWeekly: false,
            calendarContent: CalendarContent.ALL,
            notesDescription: false,
            pomodoroType: PomodoroType.SETTINGS
        },
        notificationType = NotificationType.BOTH,
        notes = {},
        pomodoro = {
            workDuration: 30,
            pauseDuration: 5,
            numberOfCycles: 5
        },
        projectsView: ProjectsView.LIST
    ) {
        this.home = home;
        this.notificationType = notificationType;
        this.notes = notes;
        this.pomodoro = pomodoro;
        this.projectsView = projectsView;
    }
}