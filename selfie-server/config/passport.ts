import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import User from '../models/User';
import bcrypt from "bcryptjs";

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

const strategy = new LocalStrategy(async (username, password, done) => {
    const user: any = await User.findOne({username: username}).exec();
    if (!user) {
        return done(null, false, {message: 'Username not found'});
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
            return done(null, user);
        } else {
            return done(null, false, {message: 'Incorrect password'});
        }
    });
});

export default strategy;