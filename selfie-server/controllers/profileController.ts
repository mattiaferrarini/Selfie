import User from "../models/User";
import bcrypt from "bcryptjs";

const changePassword = async (req: any, res: any) => {
    const {old_password, new_password} = req.body;
    try {
        const user: any = await User.findById(req.user._id);
        if (!user) return res.status(400).send('User not found');

        bcrypt.compare(old_password, user.password, async (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                user.password = new_password;
                await user.save();
                res.status(200).send('Password changed');
            } else {
                return res.status(400).send('Incorrect password');
            }
        });
    } catch (err: any) {
        res.status(400).send('Error changing password');
    }
}

const updateHomePreferences = async (req: any, res: any) => {
    const {calendarWeekly, notesDescription, pomodoroType} = req.body;
    try {
        const user: any = await User.findById(req.user._id);
        if (!user) return res.status(400).send('User not found');

        user.preferences.home.calendarWeekly = calendarWeekly;
        user.preferences.home.notesDescription = notesDescription;
        user.preferences.home.pomodoroType = pomodoroType;
        await user.save();
        res.status(200).json({"preferences": user.preferences});
    } catch (err: any) {
        res.status(400).send('Error updating home preferences');
    }
}

const changeBirthday = async (req: any, res: any) => {
    const {birthday} = req.body;
    try {
        const user: any = await User.findById(req.user._id);
        if (!user) return res.status(400).send('User not found');
        user.birthday = birthday;
        await user.save();
        res.status(200).send('Birthday changed');
    } catch (err: any) {
        res.status(400).send('Error updating pomodoro preferences');
    }
}

const changeRealName = async (req: any, res: any) => {
    const {realName} = req.body;
    try {
        const user: any = await User.findById(req.user._id);
        if (!user) return res.status(400).send('User not found');
        user.realName = realName;
        await user.save();
        res.status(200).send('Real Name changed');
    } catch (err: any) {
        res.status(400).send('Error updating pomodoro preferences');
    }
}

const updateNotificationPreferences = async (req: any, res: any) => {
    const {notificationType} = req.body;
    try {
        const user: any = await User.findById(req.user._id);
        if (!user) return res.status(400).send('User not found');

        user.preferences.notificationType = notificationType;
        await user.save();
        res.status(200).json({"preferences": user.preferences});
    } catch (err: any) {
        res.status(400).send('Error updating pomodoro preferences');
    }
}

const updatePomodoroPreferences = async (req: any, res: any) => {
    const {workDuration, pauseDuration, numberOfCycles} = req.body;
    try {
        const user: any = await User.findById(req.user._id);
        if (!user) return res.status(400).send('User not found');

        user.preferences.pomodoro.workDuration = workDuration;
        user.preferences.pomodoro.pauseDuration = pauseDuration;
        user.preferences.pomodoro.numberOfCycles = numberOfCycles;
        await user.save();
        res.status(200).json({"preferences": user.preferences});
    } catch (err: any) {
        res.status(400).send('Error updating pomodoro preferences');
    }
}

export default {
    changePassword,
    updateHomePreferences,
    changeBirthday,
    changeRealName,
    updateNotificationPreferences,
    updatePomodoroPreferences
}