const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const passport = require('passport');
var session  = require('express-session');
var flash    = require('connect-flash');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var validate = require('validator');


require('./passport')(passport); 
app.use(morgan('dev')); 
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
 
// Session
app.use(session({
	secret: 'testpassport',
	resave: true,
	cookie: { maxAge: 900000 },
	rolling: true,
	saveUninitialized: true
 } )); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash()); 

//Login
app.post('/login', function(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      
	  res.setHeader('Content-Type', 'application/json');
      return res.send({ message: info.message })
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
	  console.log(req.user);
	  res.setHeader('Content-Type', 'application/json');
      return res.send({ "message":"Welcome"+ " "+ req.user.firstname});
    });
  })(req, res, next);
});	

//Logout
app.post('/logout', function (req, res){
	console.log(req.user);
	if(req.user){
	req.session.destroy(function (err) {
	  console.log(req.user);
	res.setHeader('Content-Type', 'application/json');
    res.send({"message":"You have been successfully logged out"}); 
  });	
	}
	else{
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"You are not currently logged in"});
	}
  
});

//Ensure user is logged in
function ensureAuthenticated(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}else
	{
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"You are not currently logged in"});
	}
}

//Add
app.post('/add', ensureAuthenticated, function (req, res){
	console.log(req.body.num1 + " " + req.body.num2);
	
	if(isNaN(Number(req.body.num1)) || isNaN(Number(req.body.num2)) || !(req.body.num1) || !(req.body.num2)){
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"The numbers you entered are not valid"});
	}
	else{
	var result= Number(req.body.num1) + Number(req.body.num2);
	res.setHeader('Content-Type', 'application/json');
	res.send({"message":"The action was successful", "result": result});
	}
});

//Multiply
app.post('/multiply', ensureAuthenticated, function (req, res){
	console.log(req.body.num1 + " " + req.body.num2);
	if(isNaN(Number(req.body.num1)) || isNaN(Number(req.body.num2)) || !(req.body.num1) || !(req.body.num2)){
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"The numbers you entered are not valid"});
	}
	else{
	var result= Number(req.body.num1) * Number(req.body.num2);
	res.setHeader('Content-Type', 'application/json');
	res.send({"message":"The action was successful", "result": result});
	}
});

//Divide
app.post('/divide', ensureAuthenticated, function (req, res){
	console.log(req.body.num1 + " " + req.body.num2);
	if(isNaN(Number(req.body.num1)) || isNaN(Number(req.body.num2)) || !(req.body.num1) || !(req.body.num2) ||  (req.body.num2 == 0)){
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"The numbers you entered are not valid"});
	}
	else{
	var result= Number(req.body.num1) / Number(req.body.num2);
	res.setHeader('Content-Type', 'application/json');
	res.send({"message":"The action was successful", "result": result});
	}
});


// port must be set to 3000 because incoming http requests are routed from port 80 to port 3000
app.listen(3000, function () {
    console.log('Node app is running on port 3000');
});
