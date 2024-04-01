require("dotenv").config();
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const nocache = require('nocache');
const flash = require('connect-flash');
const path = require('path');

const connect = require('./database/dbConnect');

// Connect to the database
connect();

const app = express();
const PORT = process.env.PORT || 4000;

// Session handling
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',    
    resave: true,
    saveUninitialized: true,
   // cookie: { maxAge: 3600000 }
}));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public')); // Static files
app.use(morgan('dev')); // Logging
app.use(nocache()); // No cache
app.use(flash()); // Flash messages
app.set('view engine', 'ejs'); // View engine setup

//Middleware for flash messages
// app.use((req, res, next) => {
//     res.locals.message = req.session.message;
//     res.locals.successMessage = req.flash('successMessage');
//     res.locals.errorMessage = req.flash('errorMessage');
//     delete req.session.message;
//     next();
// });

// Routes
app.use(require("./router/adminRouter"));
app.use(require("./router/userRouter"));
app.use(require("./router/productRouter"));
app.use(require("./router/contentRouter"));
app.use(require("./router/orderRouter"));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
