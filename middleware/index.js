const Campground = require("../models/campground")
const Comment = require("../models/comment")
const Review = require("../models/review")
const middlewareObj = {}

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash("error", "Please Log In") 
    res.redirect("/login") 
}

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if(err) {
                req.flash("error", "Campground not found")
                res.redirect("back")
            } else {
                if (foundCampground.author.id.equals(req.user._id)) {
                    next()
                } else {
                    req.flash("error", "You don't have the required permissions for that action")
                    res.redirect("back") 
                }
            }
        })
    } else {
        req.flash("error", "Please Log In")
        res.redirect("back") 
    }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if(err) {
                req.flash("error", "Comment not found") 
                res.redirect("back")
            } else {
                if (foundComment.author.id.equals(req.user._id)) {
                    next()
                } else {
                    req.flash("error", "You don't have the required permissions for that action")
                    res.redirect("back") 
                }
            }
        })
    } else {
        req.flash("error", "Please Log In")
        res.redirect("back") 
    }
}

middlewareObj.checkReviewOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Review.findById(req.params.review_id, (err, foundReview) => {
            if (err || !foundReview) {
                req.flash("error", "Review not found")
                res.redirect("back") 
            } else {
                if (foundReview.author.id.equals(req.user._id)) {
                    next()
                } else {
                    req.flash("error", "You don't have the required permissions for that action")
                    res.redirect("back") 
                }
            }
        })
    } else {
        req.flash("error", "Please Log In")
        res.redirect("back") 
    }
}

middlewareObj.checkReviewExistence = (req, res, next) => {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id).populate("reviews").exec((err, foundCampground) => {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found")
                res.redirect("back") 
            } else {
                let foundUserReview = foundCampground.reviews.some(review => {
                    return review.author.id.equals(req.user._id) 
                })
                if (foundUserReview) {
                    req.flash("error", "You have already written a review")
                    return res.redirect("/campgrounds/" + foundCampground._id)
                }
                next()
            }
        })
    } else {
        req.flash("error", "Please Log In")
        res.redirect("back") 
    }
}

module.exports = middlewareObj