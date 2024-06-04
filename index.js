const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const db = require('./queries');
const flash = require('connect-flash');


const app = express();
const port = 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'secret', // Change this to a more secure secret in production
  resave: false,
  saveUninitialized: false
}));


app.use(flash());
// Initialize passport
app.use(passport.initialize());
app.use(passport.session());


// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/login', (req, res) => {
    const messages = req.flash('error');
    res.json({ success: false, messages });
  });
  

app.get('/users', db.getUsers);
app.post('/register', db.createUser);
app.post('/login', (req, res, next) => {
    console.log("Login attempt with:", req.body);
    next();
  }, passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }), (req, res) => {
    res.redirect('/dashboard');
  });


app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('Dashboard: Accessible only by authenticated users');
  } else {
    res.redirect('/login');
  }
});


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
