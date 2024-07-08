import User, {IUser} from "../models/User";
import passport from "passport";

export const register = async (req: any, res: any, next: any) => {
    const {username, real_name, email, password, birthday} = req.body;
    try {
        const newUser = new User({username, real_name, email, password, birthday});
        await newUser.save();
        passport.authenticate('local', function (err: any, user: IUser) {
            if (err) {
                next(err);
            }
            if (!user) {
                return res.redirect('/login')
            }
            res.json({user: {"username": user.username, "real_name": user.real_name}});
        })(req, res, next);
        // TODO: handling di campi duplicati (se vogliamo distinguere), eventi annessi (compleanno)
    } catch (err) {
        console.log(err)
        res.status(400).send('Error registering user');
    }
}

export const login = (req: any, res: any) => {
    res.json({user: {"username": req.user.username, "real_name": req.user.real_name}});
};

export const logout = (req: any, res: any, next: any) => {
    req.logout(function (err: any) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
};