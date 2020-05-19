//schema---------------------------------------------------------
var  mongoose = require("mongoose");
var  passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  createdOn: { type: Date, default: Date.now }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", userSchema);
//----------------------------------------------------------------

