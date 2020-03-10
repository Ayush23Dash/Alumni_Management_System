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

const postSchema = new mongoose.Schema({
  usern: String,
  title: String,
  post: String
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
const Post = new mongoose.model("Post", postSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// GET ROUTES
app.get("/", function(req, res) {
  let i = 0;
  if(req.isAuthenticated()){
    let user = req.user.username;
    i = 1;
    res.render("home",({check:i,user}));
  }else{
  res.render("home",({check:i}));
}
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
          Post.find({}, function(err, pdata) {
            res.render("dashboard", ({
              username: user,
              pdata,
              name,
              desig,
              em
            }));


          });
        } else {
          res.redirect("/login");
        }
      }
    }
  });


});

app.get("/:username/aldash", function(req, res) {
  let user = req.params.username;
  User.find({}, function(err, data) {

    for (var i = 0; i < data.length; i++) {
      if (data[i].username === user) {
        let name = data[i].name1;
        let desig = data[i].designation;
        let em = data[i].email;
        if (req.isAuthenticated()) {
          res.render("alumnidash", ({
            username: user,
            name,
            desig,
            em,
            data
          }));
        } else {
          res.redirect("/login");
        }
      }
    }
  });

});
app.get("/:username/post", function(req, res) {
  let user = req.params.username;
  User.find({}, function(err, data) {

    for (var i = 0; i < data.length; i++) {
      if (data[i].username === user) {
        let name = data[i].name1;
        let desig = data[i].designation;
        let em = data[i].email;
        if (req.isAuthenticated()) {
          res.render("adpost", ({
            username: user,
            name,
            desig,
            em,
            data
          }));
        } else {
          res.redirect("/login");
        }
      }
    }
  });
});
app.get("/:username/pastev",(req,res) => {
  let user = req.params.username;
  User.find({}, function(err, data) {

    for (var i = 0; i < data.length; i++) {
      if (data[i].username === user) {
        let name = data[i].name1;
        let desig = data[i].designation;
        let em = data[i].email;
        if (req.isAuthenticated()) {
          res.render("pastev", ({
            username: user,
            name,
            desig,
            em,
            data
          }));
        } else {
          res.redirect("/login");
        }
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

app.post('/logout', (req, res) => {
  console.log("Logging Out...");
  req.logout();
  res.redirect('/');
});

app.post("/:username", (req, res) => {
  // res.render("dashboard",{username:req.params.user});
  let user = req.params.username;
  let title = req.body.title;
  let post = req.body.post;
  let np = new Post({
    usern: user,
    title: title,
    post: post
  });
  np.save((err) => {
    if (err)
      return handleError(err);
  });

  User.find({}, function(err, data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].username === user) {
        let name = data[i].name1;
        let desig = data[i].designation;
        let em = data[i].email;
        if (req.isAuthenticated()) {
          Post.find({}, function(err, pdata) {
            res.render("dashboard", ({
              username: user,
              pdata,
              name,
              desig,
              em
            }));
          });
        } else {
          res.redirect("/login");
        }
      }
    }
  });
});



app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
