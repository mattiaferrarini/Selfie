import User from "../models/User";
import bcrypt from "bcryptjs";

export const changePassword = async (req: any, res: any) => {
    if (!req.isAuthenticated()) return res.status(401).send('Not authenticated');

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