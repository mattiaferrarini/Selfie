import User from "../models/User";
import passport from "passport";

const default_preferences = {
    home: {
        calendarWeekly: false,
        notesDescription: false,
        pomodoroType: "last"
    },
    notificationType: "email",
    notes: {},
    pomodoro: {
        workDuration: 30,
        pauseDuration: 5,
        numberOfCycles: 4
    }
}

export const register = async (req: any, res: any, next: any) => {
    const {username, realName, email, password, birthday} = req.body;
    try {
        const newUser = new User({username, realName, email, password, birthday, preferences: default_preferences});
        await newUser.save();
        passport.authenticate('local')(req, res, next);
        // TODO: handling di campi duplicati (se vogliamo distinguere), eventi annessi (compleanno)
    } catch (err) {
        console.log(err)
        res.status(400).send('Error registering user');
    }
}

export const login = (req: any, res: any) => {
    res.json({user: {"username": req.user.username, "realName": req.user.realName, birthday: req.user.birthday, "preferences": req.user.preferences}});
};

export const logout = (req: any, res: any, next: any) => {
    req.logout(function (err: any) {
        if (err) {
            return next(err);
        }
        req.session.destroy((err: any) => {
            if (err) {
                return next(err);
            }
            res.clearCookie('connect.sid');

            // TODO: close websocket connections?
        });
    });
};