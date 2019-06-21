const express = require("express")
const router = express.Router()
const Campground = require("../models/campground")
const Comment = require("../models/comment") 
const mongoose = require("mongoose")
const middleware = require("../middleware")
mongoose.set('useFindAndModify', false)

router.get("/", (req, res) => {
    Campground.find({}, (err, allCampgrounds) => {
        if(err) {
            console.log(err)
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds}) 
        }
    })
})

router.post("/", middleware.isLoggedIn, (req, res) => {
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
            req.flash("success", "Campground added") 
            res.redirect("/campgrounds") 
        }
    })
}) 

router.get("/new", middleware.isLoggedIn, (req, res) => {
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

router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render("campgrounds/edit", {campground: foundCampground}) 
    })
})

router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if(err) {
            res.redirect("/campgrounds") 
        } else {
            res.redirect("/campgrounds/" + req.params.id) 
        }
    })
})

router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
        if(err) {
            res.redirect("/campgrounds") 
        } 
        req.flash("success", "Campground deleted") 
        Comment.deleteMany({_id: {$in: campgroundRemoved.comments}}, err => {
            if(err) {
                console.log(err)
            }
            res.redirect("/campgrounds") 
        })
    })
})

module.exports = router 