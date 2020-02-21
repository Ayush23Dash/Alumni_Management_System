// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// Passport
const app = express();
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
  secret:"ourLittleSecret",
  resave:false,
  saveUnitialised:false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDb",{useNewUrlParser:true,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);
const userSchema =  new mongoose.Schema({
  userName:String,
  email:String,
  designation:String,
  mobile:Number
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/",function(req,res)
{
  res.render("home");
});
app.get("/signup",function(req,res)
{
  res.render("signup");
});
app.get("/login",function(req,res)
{
  res.render("login");
});
app.get("/login",function(req,res)
{
  res.render("login");
});
app.post("/signup",function(req,res)
{
  User.register({username:req.body.username,email:req.body.email,mobile:req.body.mob,designation:req.body.select},req.body.password,function(err,user)
{
  if(err)
  {
    console.log(err);
    res.redirect("/signup");
  }else{
    passport.authenticate("local")(req,res,function()
  {
    res.redirect("/");
    console.log("Data saved in DB");
  });
  }
});
});

app.listen(3000,function()
{
  console.log("Server is running on port 3000");
});
