const express = require("express");
var router = express.Router(),
    user = require("../models/user");

//const listener = app.listen(process.env.PORT, function() {
 // console.log("Your app is listening on port " + process.env.port);
//});

var io = require('socket.io');
//=================   CHAT route   ============================

module.exports = router;