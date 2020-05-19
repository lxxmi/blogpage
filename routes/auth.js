const express = require("express");
var router = express.Router(),
    passport = require("passport"),
    user = require("../models/user");
//=======    AUTH ROUTES           ==============================================================
//=================   REGISTER route   ============================
router.get("/register", function(req, res){
  res.render("auth/register");
});

router.post("/register", function(req , res){
  var newUser = new user({username:req.body.email, name:req.body.name});
  user.register(newUser, req.body.password, function(err, body){
    if(err){
      if(err.name == "UserExistsError"){
        req.flash("error","Email already taken please try again!");
        return res.redirect("back");
        console.log(err.name);        
      }
      res.render("auth/register");
    }else{
      console.log(body);
      passport.authenticate("local")(req, res, function(){
        req.flash("successflash", "Welcome "+body.name);
        res.redirect("/blogs");
      });
    }
  });
});
//------------------------------------------------------------

//=================   LOGIN route   ============================
router.get("/login", function(req, res){
  res.render("auth/login");
});

  router.post("/login", passport.authenticate("local",
                                          {
                                            successRedirect : "/blogs",
                                            failureRedirect : "/login",
                                            successFlash : "YOU ARE NOW LOGGED IN",
                                            failureFlash : "Authentication Failed",
                                              }) ,function(req, res){
    
  });
//----------------------------------------------------------------------

//=================   LOGOUT route   ============================

router.get("/logout", function(req, res){
  req.logout();
  console.log("User is logged out");
  req.flash('successflash','Successfully logged out!');
  res.redirect("/blogs");
});
//-----------------------------------------------





module.exports = router;