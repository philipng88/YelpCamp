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
    let noMatch = null 
    const escapeRegex = text => {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    }

    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi')
        Campground.find({name: regex}).sort({'_id': -1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec((err, allCampgrounds) => {
            Campground.countDocuments({name: regex}).exec((err, count) => {
                if (err) {
                    console.log(err)
                    res.redirect("back")
                } else {
                    if (allCampgrounds.length < 1) {
                        noMatch = "No campgrounds match that search. Please try again"
                    }
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: req.query.search 
                    })
                }
            })
        })
    } else {
        Campground.find({}).sort({'_id': -1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec((err, allCampgrounds) => {
            Campground.countDocuments().exec((err, count) => {
                if (err) {
                    console.log(err)
                } else {
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds, 
                        current: pageNumber, 
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    })
                }
            })
        })
    }
})

router.post("/", middleware.isLoggedInAndAdmin, (req, res) => {
    let name = req.body.name 
    let price = req.body.price 
    let image = req.body.image
    let description = req.body.description
    let author = {
        id: req.user._id, 
        username: req.user.username
    }
    let newCampground = {name: name, price: price, image: image, description: description, author: author}
    Campground.create(newCampground, err => {
        if(err) {
            console.log(err)
        } else {
            req.flash("success", "Campground added") 
            res.redirect("/campgrounds") 
        }
    })
}) 

router.get("/new", middleware.isLoggedInAndAdmin, (req, res) => {
    res.render("campgrounds/new") 
})

router.get("/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments likes").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}} 
    }).exec((err, foundCampground) => {
        if(err) {
            console.log(err)
        } else if(foundCampground) {
            res.render("campgrounds/show", {campground: foundCampground}) 
        } else {
            req.flash("error", "Campground not found")
            res.redirect("back") 
        }
    }) 
})

router.get("/:id/edit", middleware.isLoggedInAndAdmin, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render("campgrounds/edit", {campground: foundCampground}) 
    })
})

router.put("/:id", middleware.isLoggedInAndAdmin, (req, res) => {
    delete req.body.campground.rating 
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, campground) => {
        if(err) {
            console.log(err)
            res.redirect("/campgrounds") 
        } else {
            campground.name = req.body.campground.name 
            campground.description = req.body.campground.description
            campground.image = req.body.campground.image 
            campground.save(err => {
                if (err) {
                    console.log(err)
                    res.redirect("/campgrounds")
                } else {
                    res.redirect("/campgrounds/" + campground._id) 
                }
            })
        }
    })
})

router.delete("/:id", middleware.isLoggedInAndAdmin, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err) {
            res.redirect("/campgrounds") 
        } else {
            Comment.deleteOne({"_id": {$in: campground.comments}}, err => {
                if (err) {
                    console.log(err)
                    return res.redirect("/campgrounds")
                }
                Review.deleteOne({"_id": {$in: campground.reviews}}, err => {
                    if (err) {
                        console.log(err) 
                        return res.redirect("/campgrounds")
                    }
                    campground.deleteOne()
                    req.flash("success", "Campground deleted")
                    res.redirect("/campgrounds") 
                })
            })
        } 
    })
})

router.post("/:id/like", middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err) {
            console.log(err)
            return res.redirect("/campgrounds")
        }
        const foundUserLike = foundCampground.likes.some(like => {
            return like.equals(req.user._id) 
        })
        if (foundUserLike) {
            foundCampground.likes.pull(req.user._id) 
        } else {
            foundCampground.likes.push(req.user) 
        }
        foundCampground.save(err => {
            if (err) {
                console.log(err)
                return res.redirect("/campgrounds")
            }
            return res.redirect("/campgrounds/" + foundCampground._id) 
        })
    })
})

module.exports = router 