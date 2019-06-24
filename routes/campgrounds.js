const express = require("express")
const router = express.Router()
const Campground = require("../models/campground")
const Comment = require("../models/comment") 
const Review = require("../models/review")
const mongoose = require("mongoose")
const middleware = require("../middleware")
mongoose.set('useFindAndModify', false)

router.get("/", (req, res) => {
    let perPage = 8
    let pageQuery = parseInt(req.query.page)
    let pageNumber = pageQuery ? pageQuery : 1 
    Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec((err, allCampgrounds) => {
        Campground.count().exec((err, count) => {
            if (err) {
                console.log(err)
            } else {
                res.render("campgrounds/index", {campgrounds: allCampgrounds, current: pageNumber, pages: Math.ceil(count / perPage)})
            }
        })
    })
})

router.post("/", middleware.isLoggedIn, (req, res) => {
    let name = req.body.name 
    let price = req.body.price
    let image = req.body.image
    let description = req.body.description
    let author = {
        id: req.user._id, 
        username: req.user.username
    }
    let newCampground = {name: name, price: price, image: image, description: description, author: author}
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
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}} 
    }).exec((err, foundCampground) => {
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
    delete req.body.campground.rating 
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if(err) {
            res.redirect("/campgrounds") 
        } else {
            res.redirect("/campgrounds/" + req.params.id) 
        }
    })
})

router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err) {
            res.redirect("/campgrounds") 
        } else {
            Comment.remove({"_id": {$in: campground.comments}}, err => {
                if (err) {
                    console.log(err)
                    return res.redirect("/campgrounds")
                }
                Review.remove({"_id": {$in: campground.reviews}}, err => {
                    if (err) {
                        console.log(err) 
                        return res.redirect("/campgrounds")
                    }
                    campground.remove()
                    req.flash("success", "Campground deleted")
                    res.redirect("/campgrounds") 
                })
            })
        } 
    })
})

module.exports = router 