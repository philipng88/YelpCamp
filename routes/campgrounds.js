const express = require("express")
const router = express.Router()
const Campground = require("../models/campground")

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/login") 
}

router.get("/", (req, res) => {
    Campground.find({}, (err, allCampgrounds) => {
        if(err) {
            console.log(err)
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds}) 
        }
    })
})

router.post("/", isLoggedIn, (req, res) => {
    let name = req.body.name 
    let image = req.body.image
    let description = req.body.description
    let author = {
        id: req.user._id, 
        username: req.user.username
    }
    let newCampground = {name: name, image: image, description: description, author: author}
    Campground.create(newCampground, (err, newlyCreated) => {
        if(err) {
            console.log(err)
        } else {
            res.redirect("/campgrounds") 
        }
    })
}) 

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new") 
})

router.get("/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if(err) {
            console.log(err)
        } else {
            res.render("campgrounds/show", {campground: foundCampground}) 
        }
    }) 
})

module.exports = router 