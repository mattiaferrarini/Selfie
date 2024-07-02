import { Router } from 'express';
import passport from 'passport';
import User, {IUser} from '../models/User';
import bcrypt from "bcryptjs";

const router = Router();

// Registration route
// TODO: maybe use put?
router.post('/register', async (req: any, res, next) => {
    const { username, realName, email, password, birthday } = req.body;
    try {
        const newUser = new User({ username, realName, email, password, birthday });
        await newUser.save();
        passport.authenticate('local', function(err: any, user: IUser) {
            if (err) { next(err); }
            if (!user) { return res.redirect('/login') }
            res.json({ user: {"username": req.user.username, "real_name": req.user.realName} });
        })(req, res, next);
        // TODO: handling di campi duplicati (se vogliamo distinguere), eventi annessi (compleanno)
    } catch (err) {
        console.log(err)
        res.status(400).send('Error registering user');
    }
});

// Login route
router.post('/login', passport.authenticate('local'), (req: any, res) => {
    res.json({ user: {"username": req.user.username, "real_name": req.user.realName} });
});

// Logout route
router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

// Change password route
router.post('/change-password', async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send('Not authenticated');

    const { oldPassword, newPassword } = req.body;
    try {
        const user: any = await User.findById(req.user._id);
        if (!user) return res.status(400).send('User not found');

        bcrypt.compare(oldPassword, user.password, async (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                user.password = newPassword;
                await user.save();
                res.send('Password changed');
            } else {
                return res.status(400).send('Incorrect password');
            }
        });
    } catch (err) {
        res.status(400).send('Error changing password');
    }
});

// TODO: add forgot password?

export default router;
