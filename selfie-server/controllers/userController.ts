import {Request, Response} from 'express';
import User from '../models/User';
import {getResourceByUsername} from './resourceController';

// Get all users' username
export const getUserNames = async (req: any, res: any) => {
    const users = await User.find({}, "username");
    // extract only the username field from the users
    const usernames = users.map((user: any) => user.username);
    res.status(200).send(usernames);
}

// Check if a user/resource with the given username exists
export const getUserBasicInfo = async (req: Request, res: Response) => {
    const {username} = req.params;

    // find the user with the given username in the database
    const user = await User.findOne({username});

    if (user) {
        res.status(200).json({username: user.username, email: user.email, isResource: false});
    } else {

        const resource = await getResourceByUsername(username);

        if(resource)
            res.status(200).json({username: resource.username, isResource: true});
        else
            res.status(404).send({error: "User doesn't exist!"});
    }
}

// Find user by username
export const getUserByUsername = async (username: string) => {
    try {
        return await User.findOne({username});
    } catch {
        return null;
    }
}
