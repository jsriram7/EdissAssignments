var LocalStrategy   = require('passport-local').Strategy;

var mysql = require('mysql');

var readconnection = mysql.createConnection({
                  host     : 'mysql-useast1-instance-read-replica.ce2fvdeklmyb.us-east-1.rds.amazonaws.com',
                  user     : 'sjaikris',
                  password : 'rootadmin',
                  
               });

	
readconnection.query('USE test');


module.exports = function(passport) {

   //SerializeUser
    passport.serializeUser(function(user, done) {
   done(null, user);
});

//DeserializeUser
passport.deserializeUser(function(user, done) {
  done(null, user);
});
 
//Login Local Strategy
 passport.use('local-login', new LocalStrategy({
        
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, username, password, done) { 

         readconnection.query("SELECT * FROM `test`.userdata WHERE `username` = '" + username + "'",function(err,rows){
			 console.log("USERNAME  "+ username);
			 console.log("PASSWORD  "+ password);
			if (err)
                return done(err);
			 if (!rows.length) {
				 console.log("Username doesnot exist");
                return done(null, false, {message:'There seems to be an issue with the username/password combination that you entered'});  
            } 
			
			
            if (!( rows[0].password == password))
			{
			console.log("Password is wrong");	             
			 return done(null, false, {message:'There seems to be an issue with the username/password combination that you entered'}); 
			}
            
            return done(null, rows[0]);			
		
		});
		


    }));
        

};