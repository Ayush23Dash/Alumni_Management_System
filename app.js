// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const flash = require("flash");
const flash = require("connect-flash");
// Passport

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: "ourLittleSecret",
  resave: false,
  saveUnitialised: false
}));
app.use(passport.initialize());
app.use(passport.session());
// app.use(session()); // session middleware
app.use(flash());

mongoose.connect("mongodb://localhost:27017/userDb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);
const userSchema = new mongoose.Schema({
  name1: String,
  userName: String,
  email: String,
  designation: String,
  mobile: Number
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// GET ROUTES
app.get("/", function(req, res) {
  res.render("home");
});
app.get("/signup", function(req, res) {
  res.render("signup");
});
app.get("/login", function(req, res) {
  const errors = req.flash().error || [];
  res.render("login", {
    errors
  });
});
app.get("/:username", function(req, res) {
  let user = req.params.username;
  // Retrieving Data from db
  User.find({}, function(err, data) {

    for (var i = 0; i < data.length; i++) {
      if (data[i].username === user) {
        let name = data[i].name1;
        let desig = data[i].designation;
        let em = data[i].email;
        if (req.isAuthenticated()) {
          res.render("dashboard", ({
            username: user,
            name,
            desig,
            em
          }));
        } else {
          res.redirect("/login");
        }
      } else {
        console.log("User not found in this iteration");
      }
    }
  });

});

// POST ROUTES
app.post("/signup", function(req, res) {
  User.register({
    name1: req.body.name1,
    username: req.body.username,
    email: req.body.email,
    mobile: req.body.mob,
    designation: req.body.select
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/signup");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/" + req.body.username);
        // res.render("dashboard");
        console.log("Data saved in DB");
      });
    }
  });
});

app.post('/login',
  passport.authenticate('local', {
    faliureFlash: true,
    failureRedirect: "/login"
  }),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/' + req.user.username);
  });

app.post('/logout', function(req, res) {
  console.log("Logging Out...");
  req.logout();
  res.redirect('/');
});



app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
