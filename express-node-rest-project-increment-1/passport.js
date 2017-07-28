var LocalStrategy   = require('passport-local').Strategy;

var mysql = require('mysql');

/*var readconnection = mysql.createConnection({
                  host     : 'mysql-useast1-instance-read-replica.ce2fvdeklmyb.us-east-1.rds.amazonaws.com',
                  user     : 'sjaikris',
                  password : 'rootadmin',
                  
               });*/

	
//readconnection.query('USE test');
var connectionPool_2 = mysql.createPool({
    connectionLimit: 500, //important
    host: 'myediss-rds-instance.ce2fvdeklmyb.us-east-1.rds.amazonaws.com',
    user: 'sjaikris',
    password: 'rootadmin',
    database: 'test',
    debug: false
});

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
		connectionPool_2.getConnection(function(err, connection) {
		connection.query("SELECT * FROM `test`.userdata WHERE `username` = '" + username + "'",function(err,rows){
			 console.log("USERNAME  "+ username);
			 console.log("PASSWORD  "+ password);
			connection.release();
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
		
	
			
		});
         

    }));
        

};