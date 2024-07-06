import express from 'express';
import mongoose from "mongoose";
import passport from "passport";
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import session from "express-session";
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

// Create Express server
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:8080', // Specify the origin of your frontend
    credentials: true,               // Allow credentials (cookies, headers)
};

app.use(cors(corsOptions));
app.use(express.urlencoded({extended: true}));

// Database connection
mongoose.connect(process.env.MONGOURI || 'mongodb://localhost:27017/selfie')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
    });

// Session configuration
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
import strategy from "./config/passport";
passport.use(strategy);

// Routes
app.use('/auth', authRoutes);

// Middleware to ensure the user is authenticated
// TODO: move to a separate file?
function ensureAuthenticated(req: any, res: any, next: any) {
    if (req.isAuthenticated()) {
        return next();
    }
    // If not authenticated, you can redirect to login or send an error message
    res.status(401).send('User not authenticated');
}

app.use('/profile', ensureAuthenticated, profileRoutes);

app.listen(PORT);