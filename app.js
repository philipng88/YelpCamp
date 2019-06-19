const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const Campground = require("./models/campground")
const Comment = require("./models/comment")
const seedDB = require('./seeds')
const app = express()
const port = 3000

app.listen(port, () => {
    console.log("The YelpCamp server has started") 
})
 
mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true })
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public")) 
seedDB()

app.get("/", (req, res) => {
    res.render("landing")
})

app.get("/campgrounds", (req, res) => {
    Campground.find({}, (err, allCampgrounds) => {
        if(err) {
            console.log(err)
        } else {
            res.render("campgrounds/index", {campgrounds:allCampgrounds})
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
    res.render("campgrounds/new") 
})

app.get("/campgrounds/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if(err) {
            console.log(err)
        } else {
            res.render("campgrounds/show", {campground: foundCampground}) 
        }
    }) 
})

app.get("/campgrounds/:id/comments/new", (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err) {
            console.log(err)
        } else {
            res.render("comments/new", {campground: campground}) 
        }
    })
})

app.post("/campgrounds/:id/comments", (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err) {
            console.log(err)
            res.redirect("/campgrounds")
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if(err) {
                    console.log(err)
                } else {
                    campground.comments.push(comment)
                    campground.save()
                    res.redirect("/campgrounds/" + campground._id) 
                }
            })
        }
    })
})