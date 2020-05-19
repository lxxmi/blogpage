var blog = require("../models/blog"),
    comment =  require("../models/comment");

var middlewareObj = {};

middlewareObj.ownsPost = function(req, res, next) {
  if (req.isAuthenticated()) {
    blog.findById(req.params.id, function(err, body) {
      if (err) { 
        console.log("ERROR FINDING POST :" + err);
        return res.redirect("back");
      } else {
        if(body==null){
           req.flash("error", "Post is no longer available!");
           return res.redirect("/blogs");
        }
        if ((body.author.name="admin") || (body.author.id.equals(req.user._id))) {
          return next();
        } else {
          res.redirect("back");
        }
      }
    });
  } else {
    console.log("MUSTE BE LOGGED IN");
    res.redirect("back");
  }
};

middlewareObj.ownsComment = function(req, res, next) {
  if (req.isAuthenticated()) {
    comment.findById(req.params.comment_id, function(err, foundcomment) {
      if (err) {
        console.log("ERROR FINDING COMMENT :" + err);
        res.redirect("back");
      } else {
        if ((foundcomment.author.name="admin") || (foundcomment.author.id.equals(req.user._id)) ) {
          return next();
        } else {
          res.redirect("back");
        }
      }
    });
  } else {
    console.log("MUSTE BE LOGGED IN");
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please Log In!");
  res.redirect("/login");
}

middlewareObj.isMaster = function(req, res, next) {
  if (req.user.username == "admin@mail.com") {
    return next();
  }
  req.flash("error", "NOT A MASTER ADMIN!");
  res.redirect("/login");
}

module.exports = middlewareObj;