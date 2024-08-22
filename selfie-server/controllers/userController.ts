import { Request, Response } from 'express';
import User from '../models/User';

// get all users' username
export const getUserNames = async (req: any, res: any) => {
    const users = await User.find({}, "username");
    // extract only the username field from the users
    const usernames = users.map((user: any) => user.username);
    res.status(200).send(usernames);
}

// check if a user with the given username exists
export const getUserBasicInfo = async (req: Request, res: Response) => {
    const { username } = req.params;

    // Find the user with the given username in the database
    const user = await User.findOne({ username });

    if (user) {
        res.status(200).json({ username: user.username, email: user.email });
    } else {
        res.status(404).send({ error: "User doesn't exist!" });
    }
}

// find user by username
export const findByUsername = async (username: string) => {
    try{
        const user = await User.findOne({ username });
    return user;
    }
    catch{
        return null;
    }
}
