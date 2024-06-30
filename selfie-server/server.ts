import express from 'express';
import mongoose from "mongoose";
import passport from "passport";
import authRoutes from './routes/auth';
import session from "express-session";
import mongoUri from "./secret";

// Create Express server
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Database connection
mongoose.connect(mongoUri)
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

app.listen(PORT);