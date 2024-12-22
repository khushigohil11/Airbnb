const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongo_url = "mongodb://127.0.0.1:27017/wanderlust_new";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const sessionOption = {
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

main().then(()=>{
    console.log("connect to db");
}).catch((err)=>{
    console.log(err);
})
async function main()
{
    await mongoose.connect(mongo_url);
}

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method")); 
app.use(express.static(path.join(__dirname,"/public")));

app.engine("ejs",ejsMate);
 
app.get("/",(req,res)=>{
    console.log("root");
    res.send("root bhai");
});

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    // console.log(req.user)
    res.locals.currUser = req.user;  
    // console.log(res.locals.currUser);
    next();
});

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/", userRouter);


app.all("*",(req,res,next)=>{
   next(new ExpressError(404,"Page Not Found"));     
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="something Went Wrong"} = err;
    res.status(statusCode).render("listings/error.ejs",{message});
    // res.status(statusCode).send(message);  
});

app.listen(8080,()=>{
    console.log("server is listing to port 8080");
})