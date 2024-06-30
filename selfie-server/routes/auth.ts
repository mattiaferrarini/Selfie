import { Router } from 'express';
import passport from 'passport';
import User from '../models/User';
import bcrypt from "bcryptjs";

const router = Router();

// Registration route
router.post('/register', async (req, res) => {
    const { username, realName, email, password, birthday } = req.body;
    try {
        const newUser = new User({ username, realName, email, password, birthday });
        await newUser.save();
        res.status(201).send('User registered');
        // TODO: handling di campi duplicati (se vogliamo distinguere), eventi annessi (compleanno)
    } catch (err) {
        console.log(err)
        res.status(400).send('Error registering user');
    }
});

// Login route
router.post('/login', passport.authenticate('local'), (req, res) => {
    res.send('Logged in');
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
