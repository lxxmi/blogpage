const express = require("express");
var router = express.Router(),
    passport = require("passport"),
    multer = require("multer"),
    blog = require("../models/blog"),
    comment = require("../models/comment"),
    user = require("../models/user"),
    middleware = require("../middleware/");
var fs = require('fs');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});/*
comment.deleteMany({}, function(err){
  if(err){
    console.log("error deleting users:"+err);
  }
});  
  comment.find({}, function(err, body){
    if(err){console.log("ERROR RETREIVING DATA:"+err)
           }
    else{
    console.log("DATA:"+body);      
    }
  });
*/

router.get("/test", function(req, res) {
  console.log("SERVER IS RUNNING");
  res.render("blog/new");
  
  //res.redirect("blogs");
});

// ROOT ROUTE -----------------------------------------------------
router.get("/", (req,res)=>{
  console.log("Server is Running");
  res.render("blog/landing");
});

router.get("/delete", function(req, res) {
  console.log("SERVER IS RUNNING");
  comment.deleteMany({},(err, body)=>{});
  blog.deleteMany({},(err,body)=>{});
  user.deleteMany({},(err, body)=>{});
  res.redirect("blogs");
  //res.redirect("blogs");
});
//  blog.findById(req.params.id).populate("comments", "user").exec(function(err, body) {

router.get("/blogs", function(req, res) {
  blog.find({}).populate("comments").populate("author").exec(function(err, body) {
//  blog.find({}, function(err, body) {
    if (err) {
      console.log("ERR on routing /blogs:" + err);
    } else { 
      res.render("blog/index", {body});
      //console.log("body:" + body);
    }
  });

});

// NEW POST ROUTE ------------------------------------
router.get("/blogs/new",middleware.isLoggedIn, function(req, res) {
  res.render("blog/new");
});

// CREATE NEW POST ROUTE ---------------------------------

router.post("/newpost", middleware.isLoggedIn, upload.single('image'), function(req, res) {
  //    req.body.blog.body = sanitizer(req.body.blog.body);
  var newblog ={};
  newblog.title = req.body.title;
  newblog.image = req.file.path
  newblog.desc = req.body.desc;
  newblog.author = req.user;
  console.log(newblog);
//  newblog.img.data = fs.readFileSync(req.file);
//  newblog.img.contentType = 'image/png';
  blog.create(newblog, function(err, body) {
    if (err) {
      console.log("ERR" + err);
    } else {
      console.log("post ADDED:" + body);
       req.flash("successflash", "New Post Added!");
      res.redirect("/blogs");
    }
  });
});

// SHOW POST ROUTE -------------------------------------

router.get("/blogs/:id", function(req, res) {
//  comment.find().populate("author").exec(function(err, comment){} );
  var id = req.params.id;
  blog.findById(req.params.id).populate("author").populate({
    path: 'comments',
    populate: { path: 'author' }
  }).exec(function(err, body) {
    if (err) {
      console.log("error finding/showing a post:" + err);
    } else {
            console.log("post found:" + body);
            res.render("blog/show", { blog, body });
    }
  });
});

// EDIT ROUTE --------------------------------------------

router.get("/blogs/:id/edit", middleware.ownsPost, function(req, res) {
  blog.findById(req.params.id, function(err, body) {
    if (err) {
      console.log("ERROR FINDING POST :" + err);
    } else {
      res.render("blog/edit", { blog: body });
    }
  });
});

// UPDATE POST ROUTE --------------------------------------------------
router.put("/blogs/:id",  middleware.ownsPost, function(req, res) {
  //req.body.blog.body = sanitizer(req.body.blog.body);
  blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, body) {
    if (err) {
      console.log("ERROR" + err);
      res.redirect("back");
   } else {
     req.flash("successflash", "Post Updated Successfully!");
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

// DELETE POST ROUTE ---------------------------------------------------
router.delete("/blogs/:id", middleware.ownsPost, function(req, res) {
  blog.findByIdAndRemove(req.params.id, function(err, body) {
    if (err) {
      console.log("ERROR DELETING ITEM:" + err);
      res.redirect("back");
    } else {
      req.flash("successflash", "Post Deleted!");
      res.redirect("/blogs");
    }
  });
});

//=================== MASTER ADMIN ROUTE ================
router.get("/users", middleware.isLoggedIn, middleware.isMaster, function(req, res){
user.find({}, function(err, body) {
    if (err) {
      console.log("ERR:" + err);
    } else { 
      res.render("blog/users", {body});
      console.log("body:" + body);
    }
  });
});

// USER POSTS ROUTE--------------------------------------
router.get("/userposts/:userId", middleware.isLoggedIn,  function(req, res){
  var userId = req.params.userId;
  blog.find({author:userId}).populate("author").exec(function(err, blog) {
    if (err) {
      console.log("ERR:" + err);
    } else {
        if(blog.length == 0){
          req.flash("error", "No Posts Found");
          return res.redirect("back");
        }
        console.log("blog found:"+blog);
      var username = blog[0].author.name;
        res.render("blog/userposts", {blog,username});
    }
  });
});


// EDIT USERNAME ROUTES------------------------------------------
router.get("/users/:userId/edit", function(req, res) {
      res.render("auth/edit");
});

router.put("/users/:userId", function(req, res) {
     user.findByIdAndUpdate(req.params.userId,{name:req.body.newname}, function(err, body){
       if(err){
         console.log("ERROR UPDATING USER WITH GIVEN USERNAME" + err);
       }else{
         console.log(body);
         req.flash("successflash","Username Updated!");
         res.redirect("/blogs");
       }
     });
     //req.flash("successflash", "Post Updated Successfully!");
      //res.redirect("/blogs");
});

// DELETE USER ROUTE ---------------------------------------------------
router.delete("/users/:userId", middleware.isMaster, function(req, res) {
  var userId = req.params.userId;
  user.findByIdAndRemove(userId, function(err, body) {
    if (err) {
      console.log("ERROR DELETING ITEM:" + err);
      req.flash("error", "Couldn't delete user");
      res.redirect("back");
    } else {
      req.flash("successflash", "User Deleted!!!");
      res.redirect("back");
    }
  });
});

module.exports = router;
