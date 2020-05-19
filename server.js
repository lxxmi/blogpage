
// init project
const express = require("express"),
      bodyparser = require("body-parser"),
      mongoose = require("mongoose"),
      methodOverride = require("method-override"),
      sanitizer = require("express-sanitizer"),
      passport = require("passport"),
      localStrategy = require("passport-local"),
      session = require("express-session"),
      flash = require("connect-flash"),
      multer = require("multer"),
      blog = require("./models/blog"),
      comment = require("./models/comment"),
      user = require("./models/user");
const app = express();

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

var io = require('socket.io')(listener);

var authRoute = require("./routes/auth.js"),
    commentRoute = require("./routes/comment.js"),
    blogRoute = require("./routes/blog.js"),
    chatRoute = require("./routes/chat.js");

// APP CONFIG----------------------------------------------------------

app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());
//app.use(sanitizer);
 
//PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret:"Shutter Island is the best movie",
  resave:false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, done) {
    user.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      return done(null, user);  
    });
}
));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.use(function(req, res, next){
  res.locals.currentUser = req.user || null;
  res.locals.successflash = req.flash("successflash");
  res.locals.error = req.flash("error");
  next();
});

app.use(authRoute);
app.use(commentRoute);
app.use(blogRoute);
app.use(chatRoute);




//connection ----------------
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
//========================================================================

var noOfUsers = 0;

app.get("/chat", function(req, res){
  res.render("chat");
  console.log("User Count;"+noOfUsers);
});
app.get("/login0", function (req, res){
  res.render("auth/login0");
});

io.on("connection", (socket)=>{
    noOfUsers++;  
  socket.on("setUsername", (data)=>{
    socket.username = data;
    console.log(`${socket.username} : ${socket.id} is connected!`);
    socket.broadcast.emit("userJoined", data);
    io.emit("userCount", noOfUsers);
  });
  socket.on("typing", (msg)=>{
    console.log("keypress");
    socket.broadcast.emit("typing", msg);
    console.log(msg);
  });

  socket.on("stoptyping", (msg)=>{
    socket.broadcast.emit("stoptyping", msg);
  });
    
  socket.on("new message", (msg)=>{
    console.log(`message received at server: ${msg}`);
    socket.broadcast.emit("new message", msg);
  });
  
  socket.on("disconnect", ()=>{
    socket.on("stoptyping", (msg)=>{
      socket.broadcast.emit("stoptyping", msg);
    });
    console.log(`${socket.username} : ${socket.id} is disconnected!`);
    socket.broadcast.emit("userLeft",socket.username);
    noOfUsers--;
    io.emit("userCount", noOfUsers);
    console.log("User Count;"+noOfUsers);
  });
});
  console.log("User Count;"+noOfUsers);
