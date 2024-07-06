import { Router } from 'express';
import passport from 'passport';
import User, {IUser} from '../models/User';
import bcrypt from "bcryptjs";

const router = Router();

// Registration route
router.put('/register', async (req: any, res, next) => {
    const { username, real_name, email, password, birthday } = req.body;
    try {
        const newUser = new User({ username, real_name, email, password, birthday });
        await newUser.save();
        passport.authenticate('local', function(err: any, user: IUser) {
            if (err) { next(err); }
            if (!user) { return res.redirect('/login') }
            res.json({ user: {"username": user.username, "real_name": user.real_name} });
        })(req, res, next);
        // TODO: handling di campi duplicati (se vogliamo distinguere), eventi annessi (compleanno)
    } catch (err) {
        console.log(err)
        res.status(400).send('Error registering user');
    }
});

// Login route
router.post('/login', passport.authenticate('local'), (req: any, res) => {
    res.json({ user: {"username": req.user.username, "real_name": req.user.real_name} });
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

// TODO: add forgot password?

export default router;
