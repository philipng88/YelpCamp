require('dotenv').config() 
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const flash = require("connect-flash") 
const passport = require("passport")
const LocalStrategy = require("passport-local")
const methodOverride = require("method-override")
const User = require("./models/user") 
const app = express()
const port = parseInt(process.env.DB_PORT)

const commentRoutes = require("./routes/comments")
const reviewRoutes = require("./routes/reviews")
const campgroundRoutes = require("./routes/campgrounds")
const indexRoutes = require("./routes/index")

mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true })
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public")) 
app.use(methodOverride("_method")) 
app.use(flash()) 

app.use(require("express-session")({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.locals.moment = require('moment') 

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate())) 
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user 
    res.locals.error = req.flash("error")
    res.locals.success = req.flash("success") 
    next() 
})

app.use("/", indexRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/comments", commentRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes) 

app.listen(port, () => {
    console.log(`The YelpCamp server has started on port ${port}`) 
})
