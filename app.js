const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

// load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Passport config
require('./config/passport')(passport);
// Db config
const db = require('./config/database');

// Map global promise - to get rid of warning
mongoose.Promise = global.Promise;
//connect to mongoose
mongoose.connect(db.mongoURI, {
})
    .then(() => console.log('Mongo Db Connected !'))
    .catch(err => console.log(err));


// handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars'); // setting view engine to handle bars

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// static folder
app.use(express.static(path.join(__dirname, 'public'))); // sets public folder to express static folder
// __dirname gives path of the folder


// method override middleware
app.use(methodOverride('_method'));

// express-session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

// passport middleware - always put it after express session middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variable
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next(); // calls next peace of middleware
});

// Index route
app.get('/', (req, res) => {
    const title = 'Welcome';
    res.render('index', {
        title: title
    });

});

// About route
app.get('/about', (req, res) => {
    res.render('about');
});


// Use routes
app.use('/ideas', ideas);
app.use('/users', users);


const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Server started on port :' + port);
});