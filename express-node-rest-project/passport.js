var LocalStrategy   = require('passport-local').Strategy;

var mysql = require('mysql');

var connection = mysql.createConnection({
                  host     : 'localhost',
                  user     : 'root',
                  password : 'admin',
                  
                });

connection.query('USE test');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    passport.serializeUser(function(user, done) {
   done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
 

 passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form

         connection.query("SELECT * FROM `users` WHERE `username` = '" + username + "'",function(err,rows){
			 console.log("USERNAME  "+ username);
			 console.log("PASSWORD  "+ password);
			if (err)
                return done(err);
			 if (!rows.length) {
				 console.log("Username doesnot exist");
                return done(null, false, {message:'There seems to be an issue with the username/password combination that you entered'}); // req.flash is the way to set flashdata using connect-flash
            } 
			
			// if the user is found but the password is wrong
            if (!( rows[0].password == password))
			{
			console.log("Password is wrong");	             
			 return done(null, false, {message:'There seems to be an issue with the username/password combination that you entered'}); // create the loginMessage and save it to session as flashdata
			}
            // all is well, return successful user
            return done(null, rows[0]);			
		
		});
		


    }));
        

};