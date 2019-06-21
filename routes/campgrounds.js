const express = require("express")
const router = express.Router()
const Campground = require("../models/campground")
const Comment = require("../models/comment") 
const mongoose = require("mongoose")
mongoose.set('useFindAndModify', false)

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/login") 
}

const checkCampgroundOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if(err) {
                res.redirect("back")
            } else {
                if (foundCampground.author.id.equals(req.user._id)) {
                    next()
                } else {
                    res.redirect("back") 
                }
            }
        })
    } else {
        res.redirect("back") 
    }
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

router.get("/:id/edit", checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render("campgrounds/edit", {campground: foundCampground}) 
    })
})

router.put("/:id", checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if(err) {
            res.redirect("/campgrounds") 
        } else {
            res.redirect("/campgrounds/" + req.params.id) 
        }
    })
})

router.delete("/:id", checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
        if(err) {
            res.redirect("/campgrounds") 
        } 
        Comment.deleteMany({_id: {$in: campgroundRemoved.comments}}, err => {
            if(err) {
                console.log(err)
            }
            res.redirect("/campgrounds") 
        })
    })
})

module.exports = router 