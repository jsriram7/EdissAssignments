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
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
 
// required for passport
app.use(session({
	secret: 'testpassport',
	resave: true,
	cookie: { maxAge: 60000 },
	rolling: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.post('/login', function(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      // *** Display message without using flash option
      // re-render the login form with a message
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

app.get('/logout', function (req, res){
	console.log(req.user);
	if(req.user){
	req.session.destroy(function (err) {
	  console.log(req.user);
	res.setHeader('Content-Type', 'application/json');
    res.send({"message":"You have been successfully logged out"}); //Inside a callback… bulletproof!
  });	
	}
	else{
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"You are not currently logged in"});
	}
  
});

function ensureAuthenticated(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}else
	{
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"You are not currently logged in"});
	}
}

app.post('/add', ensureAuthenticated, function (req, res){
	console.log(req.body.num1 + " " + req.body.num2);
	if(!validate.isNumeric(req.body.num1) || !validate.isNumeric(req.body.num2) || validate.isEmpty(req.body.num1) || validate.isEmpty(req.body.num2)){
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"The numbers you entered are not valid"});
	}
	else{
	var result= +req.body.num1 + +req.body.num2;
	res.setHeader('Content-Type', 'application/json');
	res.send({"message":"The action was successful", "result": result});
	}
});

app.post('/multiply', ensureAuthenticated, function (req, res){
	console.log(req.body.num1 + " " + req.body.num2);
	if(!validate.isNumeric(req.body.num1) || !validate.isNumeric(req.body.num2) || validate.isEmpty(req.body.num1) || validate.isEmpty(req.body.num2)){
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"The numbers you entered are not valid"});
	}
	else{
	var result= req.body.num1 * req.body.num2;
	res.setHeader('Content-Type', 'application/json');
	res.send({"message":"The action was successful", "result": result});
	}
});

app.post('/divide', ensureAuthenticated, function (req, res){
	console.log(req.body.num1 + " " + req.body.num2);
	if(!validate.isNumeric(req.body.num1) || !validate.isNumeric(req.body.num2) || validate.isEmpty(req.body.num1) || validate.isEmpty(req.body.num2)  ||  (req.body.num2 == 0)){
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"The numbers you entered are not valid"});
	}
	else{
	var result= req.body.num1 / req.body.num2;
	res.setHeader('Content-Type', 'application/json');
	res.send({"message":"The action was successful", "result": result});
	}
});


// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(8080, function () {
    console.log('Node app is running on port 8080');
});
