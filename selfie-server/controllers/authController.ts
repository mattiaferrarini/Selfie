import User from "../models/User";
import passport from "passport";
import {getResourcesByUsername} from "./resourceController";
import {getUserByUsername} from "./userController";


const default_preferences = {
    home: {
        calendarWeekly: false,
        calendarContent: "all",
        notesCategory: false,
        noteNumber: 5,
        pomodoroType: "stats",
        onlyAssigned: false
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
        if (await getResourcesByUsername(username) || await getUserByUsername(username)) {
            res.status(400).send('Username not available');
            return;
        } else {
            const newUser = new User({username, realName, email, password, birthday, preferences: default_preferences});
            await newUser.save();
            passport.authenticate('local')(req, res, next);
        }
    } catch (err) {
        res.status(400).send('Error registering user');
    }
}

export const login = (req: any, res: any) => {
    res.json({
        user: {
            "username": req.user.username,
            "realName": req.user.realName,
            isAdmin: req.user.isAdmin,
            email: req.user.email,
            birthday: req.user.birthday,
            "preferences": req.user.preferences
        }
    });
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
            res.status(200).send('Logged out');
            // TODO: close websocket connections?
        });
    });
};