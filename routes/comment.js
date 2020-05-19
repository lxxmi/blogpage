const express = require("express");
var router = express.Router(),
    passport = require("passport"),
    blog = require("../models/blog"),
    comment = require("../models/comment"),
    user = require("../models/user"),
    middleware = require("../middleware/");    

// COMMENTS ROUTES =======================================================================
router.get("/blogs/:id/comments/new",middleware.isLoggedIn, function(req, res){
  blog.findById(req.params.id, function(err, blog){
    if (err) {
      console.log("ERROR FINDING POST :" + err);
    }else{
      res.render("comment/new", {blog:blog});
    }
  });
});

router.post("/blogs/:id/comments", middleware.isLoggedIn, function(req, res){
  var id = req.params.id;
  blog.findById(id, function(err, blog){
    if (err) {
      console.log("ERROR FINDING POST :" + err);
      res.render("/blogs");
    }else{
      comment.create(req.body.comment , function(err, comment){
        if(err){
          console.log("ERROR CREATING COMMENT :" + err);
          res.render("/blogs");
        }else{          
//          comment.author.id = req.user._id;
//          comment.author.name = req.user.name;
          comment.author = req.user;
          comment.save();
          console.log(comment);
          blog.comments.push(comment);
          blog.save();
          console.log("COMMENTS ADDED TO BLOG:"+blog);
          res.redirect("/blogs/"+id);
        }
      });
    }
  });
});

// EDIT ROUTE --------------------------------------------

router.get("/blogs/:id/comments/:comment_id/edit", middleware.ownsComment, function(req, res) {
  var blog_id = req.params.id;
  comment.findById(req.params.comment_id, function(err, comment) {
    if (err) {
      console.log("ERROR FINDING COMMENT :" + err);
    } else {
      res.render("comment/edit", { comment, blog_id });
    }
  });
});

// UPDATE POST ROUTE --------------------------------------------------
router.put("/blogs/:id/comments/:comment_id/", middleware.ownsComment, function(req, res) {
  //req.body.blog.body = sanitizer(req.body.blog.body);
  comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, body) {
    if (err) {
      console.log("ERROR" + err);
      res.redirect("back");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

// DELETE POST ROUTE ---------------------------------------------------
router.delete("/blogs/:id/comments/:comment_id", middleware.ownsComment, function(req, res) {
  comment.findByIdAndRemove(req.params.comment_id, function(err, body) {
    if (err) {
      console.log("ERROR DELETING COMMENT:" + err);
      res.redirect("back");
    } else {
      res.redirect("/blogs/"+ req.params.id);
    }
  });
});

//=========================================================================================


//-----------------------------------------------

module.exports = router;