const Campground = require("../models/campground")
const Comment = require("../models/comment")
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

module.exports = middlewareObj