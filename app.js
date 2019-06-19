const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const Campground = require("./models/campground")
const app = express()
const port = 3000

app.listen(port, () => {
    console.log("The YelpCamp server has started") 
})

mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true })
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("landing")
})

app.get("/campgrounds", (req, res) => {
    Campground.find({}, (err, allCampgrounds) => {
        if(err) {
            console.log(err)
        } else {
            res.render("index", {campgrounds:allCampgrounds})
        }
    })
})

app.post("/campgrounds", (req, res) => {
    let name = req.body.name 
    let image = req.body.image
    let description = req.body.description
    let newCampground = {name: name, image: image, description: description}
    Campground.create(newCampground, (err, newlyCreated) => {
        if(err) {
            console.log(err)
        } else {
            res.redirect("/campgrounds") 
        }
    })
}) 

app.get("/campgrounds/new", (req, res) => {
    res.render("new.ejs") 
})

app.get("/campgrounds/:id", (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err) {
            console.log(err)
        } else {
            res.render("show", {campground: foundCampground}) 
        }
    }) 
})