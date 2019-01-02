/*  EXPRESS SETUP  */

const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');

/* MONGOOSE SETUP */
const mongoose = require('mongoose');
const options = { keepAlive: 300000, connectTimeoutMS: 30000 };
mongoose.connect('mongodb://localhost/MyDatabase', options);
const db = mongoose.connection;

const Schema = mongoose.Schema;
const UserDetail = new Schema({
      username: String,
      password: String
    });
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');


app.use(bodyParser.json({
  limit: '500mb',
  parameterLimit: 100000 }));

app.use(bodyParser.urlencoded({
  limit: '500mb',
  extended: true }));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

const passport = require('passport');

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(id, cb) {
  UserDetails.findById(id, function(err, user) {
    cb(err, user);
  });
});

app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.use(passport.initialize());

app.use(passport.session());

app.use(cookieParser());

app.get('/', (req, res) => res.sendFile('auth.html', { root : __dirname}));

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    res.send({'username': req.user.username});
});



const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));

/*  PASSPORT SETUP  */

app.use(function (req, res, next) {
  if (!req.isAuthenticated())
    res.send({data: null , err: 'Not authenticated'})
  else 
    return next();
});

app.get('/success', function(req, res){
  res.send("Welcome "+ req.query.username + "!!")
});

app.get('/error', (req, res) => res.send("error logging in"));

/* PASSPORT LOCAL AUTHENTICATION */

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log('$$$$$$$$$$$$$', username, password)
      UserDetails.findOne({
        username: username 
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        if (user.password != password) {
          return done(null, false);
        }
        return done(null, user);
      });
  }
));

app.get('/getUserInfo', function(req, res){
   res.send({data: req.session.user})
});