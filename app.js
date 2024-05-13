require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./server/config/db');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf');
const {isActiveRoute} = require('./server/helpers/routerHelpers')

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Initialize session middleware with MongoDB store
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}));

// Initialize csurf middleware
app.use(csrf({ cookie: true }));

// Make CSRF token available to views
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Override POST requests with '_method' query parameter to support DELETE/PUT requests
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Set up static files directory
app.use(express.static('public'));

// Templating Engine setup
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute


// Routes
app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on PORT localhost:${PORT}`);
});
