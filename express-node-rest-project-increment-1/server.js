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

//var connection = mysql.createConnection({
  //  host: 'localhost',
    //user: 'root',
    //password: 'admin',
    //database: 'test'
//});
var connection = mysql.createConnection({
                  host     : 'mysql-useast1-instance.ce2fvdeklmyb.us-east-1.rds.amazonaws.com',
                  user     : 'sjaikris',
                  password : 'Madhumitha&7',
				  database : 'test'
                });


connection.connect()
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
      return res.send({ "message":"Welcome"+ " "+ req.user.fname});
    });
  })(req, res, next);
});	

//RegisterUser
app.post('/registerUser', function (req, res, callback) {
	
    var fname = req.body.fname;
	var lname = req.body.lname;
	var address = req.body.address;
	var city = req.body.city;
	var state = req.body.state;
	var zip = req.body.zip;
	var email = req.body.email;
	var username = req.body.username;
    var pwd = req.body.password;
	var params =[fname,lname,address,city,state,zip,email,username,pwd];	
    
	if (!fname || !lname || !address || !city || !state || !zip || !email || !username || !pwd) {
        return res.send({"message": "The input you provided is not valid" });
    }
	else{
	connection.query("INSERT INTO test.userdata set fname=? , lname=? , address=? ,  city =?, state=? , zip= ?, email=? , username= ?, password= ? ", params, function (error, results, fields) {
			var obj= '{"message":"'+req.body.fname+ ' was registered successfully"}';
			if (error){
				if (error.code === "ER_DUP_ENTRY") {
				
			console.log("Duplicate entry detected");
			
			return res.send({ error:true, "message": "The input you provided is not valid" }); 
					 
			}
				throw error;
			}
			return res.send(obj);
	 });
	
	}
	
	(req, res, callback);
    
});

//Update contact info
app.post('/updateInfo', ensureAuthenticated, function (req, res,callback) {
 
    	var queryString = 'UPDATE test.userdata SET ';
		var obj;
        if(req.body.fname)
        {
         queryString=queryString+ "fname='"+req.body.fname+"',";
        }
        if(req.body.lname)
        {
        queryString=queryString+ "lname='"+req.body.lname+"',";
        }
        if(req.body.address)
        {
        queryString=queryString+ "address='"+req.body.address+"',";
        }
        if(req.body.city)
        {
        queryString=queryString+ "city='"+req.body.city+"',";
        }
        if(req.body.state)
        {
        queryString=queryString+ "state='"+req.body.state+"',";
        }
        if(req.body.zip)
        {
        queryString=queryString+ "zip='"+req.body.zip+"',";
        }
        if(req.body.email)
        {
        queryString=queryString+ "email='"+req.body.email+"',";
        }
        if(req.body.username)
        {
        queryString=queryString+ "username='"+req.body.username+"',";
		}
		if(req.body.password)
        {
        queryString=queryString+ "password='"+req.body.password+"',";
        }
		
		queryString = queryString.substring(0, queryString.length - 1);
		queryString = queryString + ' ' + 'WHERE username = ' + '"'+ req.user.username + '"';
		console.log(queryString);
		connection.query(queryString, function (error, results, fields) {
			if (error){
							
			return res.send({ error:true, "message": "The input you provided is not valid" }); 
			throw error;
			}
				if(req.body.username){
					req.user.username=req.body.username;
				}
				connection.query('SELECT * FROM test.userdata WHERE username=' + '"' + req.user.username + '"' , function (error,rows) {
					if (error){
						throw error;
					}
				req.user=rows[0];
				console.log("Replaced the session username" +' '+ req.user.username);
				console.log("Replaced the session fname" + ' '+ req.user.fname);
				obj= '{"message":"'+req.user.fname+ ' your information was successfully updated"}';
				return res.send(obj);
			});
			
	 });
	(req, res, callback);
	
});

//View Users
app.post( '/viewUsers', ensureAuthenticated,  function(req, res) { 
 var params =[req.body.fname,req.body.lname];
 var userparam=[req.body.username];
 var currentlyLoggedInUser = req.user.username;
 var queryString_withfname = "SELECT fname,lname,username from test.userdata where fname like '%"+req.body.fname+"%'";
 var queryString_withlname = "SELECT fname,lname,username from test.userdata where lname like '%"+req.body.lname+"%'";
 var queryString_withboth = "SELECT fname,lname,username from test.userdata where fname like '%"+req.body.fname+"%' and lname like '%"+req.body.lname+"%'";
 var queryString_withnone = "SELECT fname,lname,username from test.userdata";
 var finalQuery;
 if( currentlyLoggedInUser != "jadmin") 
 {
    var obj= '{"message":"You must be an admin to perform this action"}';
    return res.send(obj);            
 }
 else{
	 if(req.body.fname && !req.body.lname){
		 finalQuery =  queryString_withfname ;
		 }
	 else if(req.body.lname && !req.body.fname)
	 {
		 finalQuery =  queryString_withlname ;
	 }
	 else if(req.body.lname && req.body.fname)
	 {
		 finalQuery =  queryString_withboth ;
	 }
	 else{
		 finalQuery =  queryString_withnone ;
	 }
	 console.log("The final query is" + finalQuery);
	 
	var queries = connection.query(finalQuery,  function(error, rows, fields) {
   if (!error && rows.length > 0 )
    {    
          var obj= '{"message":"The action was successful","user":[';    
          var resultSet = [];
          for(var i =0; i< rows.length; i++)
          {
              var usr= '{"fname":"'+rows[i].fname+'","lname":"'+rows[i].lname+'","userId":"'+rows[i].username+'"}';
              resultSet.push(usr);
          }
          obj=obj+resultSet+']}';
          return res.send(obj);
    }            
   else if(error)
    {
      throw error;
    }
   else if(!error && rows.length == 0)          
    {       
    
      var obj= '{"message":"There are no users that match that criteria"}';
      return res.send(obj);  
    } 
 });
}
 //(req,res,next);
});

//AddProducts
app.post('/addProducts', ensureAuthenticated, function (req, res) {
	var currentlyLoggedInUser = req.user.username;
    if( currentlyLoggedInUser != "jadmin") 
	{
    var obj= '{"message":"You must be an admin to perform this action"}';
    return res.send(obj);            
	}
	else{
	var asin = req.body.asin;
	var productName = req.body.productName;
	var productDescription = req.body.productDescription;
	var group = req.body.group;
	
	var params =[asin,productName,productDescription,group];	
    
	if (!asin || !productName || !productDescription || !group) {
        return res.send({"message": "The input you provided is not valid" });
    }
	else{
	connection.query("INSERT INTO test.productdata set asin=? , productName=? , productDescription=? , `group` =? ", params, function (error, results, fields) {
			var obj= '{"message":"'+req.body.productName+ ' was successfully added to the system"}';
			if (error){
				if (error.code === "ER_DUP_ENTRY") {
				
			console.log("Duplicate entry detected");
			
			return res.send({ error:true, "message": "The input you provided is not valid" }); 
					 
			}
				throw error;
			}
			return res.send(obj);
	 });
	
	 }	
	}
	
   
});

//Modify Products
app.post('/modifyProduct', ensureAuthenticated, function (req, res) {
 
    	var queryString = "UPDATE test.productdata SET productDescription=" + "'" + req.body.productDescription +"'" + " , productName=" + "'" + req.body.productName +"'" + ", `group`=" + "'" + req.body.group +"'" + " where asin = " + "'" + req.body.asin +"'" ;
		var currentlyLoggedInUser = req.user.username;
    if( currentlyLoggedInUser != "jadmin") 
	{
    var obj= '{"message":"You must be an admin to perform this action"}';
    return res.send(obj);            
	}
	else
	{
		if(!req.body.asin || !req.body.productName || !req.body.productDescription  ){
		return res.send({"message": "The input you provided is not valid" });	
		}
		var obj;
        console.log(queryString);
		
		connection.query(queryString, function (error, results, fields) {
			if (error){
							
				return res.send({ error:true, "message": "The input you provided is not valid" }); 
				throw error;
			}
			if(results.affectedRows == 0){
				return res.send({ error:true, "message": "The input you provided is not valid" });
			}	
			else{
				obj= '{"message":"'+req.body.productName+ ' was successfully updated"}';
				return res.send(obj);
			}
				
			});
	}
	});
	
//viewProducts
app.post( '/viewProducts',  function(req, res) { 
	var params =[req.body.asin,req.body.keyword,req.body.group];
	var asin= req.body.asin;
	var keyword= req.body.keyword;
	var group = req.body.group;
	var queryString ;
	if(keyword)
{
    if(asin && group)
    queryString="SELECT * from ((SELECT asin,productName,productDescription,`group` from test.productdata where productName like '%" + keyword + "%' or productDescription like '%" + keyword + "%') as innertable) where asin='" + asin + "' and `group` like '%" + group + "%'";
	else if(!asin && group)
    queryString="SELECT * from ((SELECT asin,productName,productDescription,`group` from test.productdata where productName like '%" + keyword + "%' or productDescription like '%" + keyword + "%') as innertable) where `group` like '%" + group + "%'";
    else if(!asin && !group)
    queryString="SELECT * from ((SELECT asin,productName,productDescription,`group` from test.productdata where productName like '%" + keyword + "%' or productDescription like '%" + keyword + "%') as innertable)";
    else if(asin && !group)
    queryString="SELECT * from ((SELECT asin,productName,productDescription,`group` from test.productdata where productName like '%" + keyword + "%' or productDescription like '%" + keyword +  "%') as innertable) where asin='"+ asin +"'";
}  

else
{
    if(asin && !group)
    queryString="SELECT * from test.productdata where asin='"+asin+"'";
    else if(grp && !pin)
    queryString="SELECT * from test.productdata where `group` like '%"+group+"%'";
    else if(asin && group)
    queryString="SELECT * from test.productdata where asin='"+asin+"' and `group` like '%"+group+"%'";
	else{
	queryString = "SELECT * from test.productdata ";
	}

}
	console.log(queryString);
	connection.query(queryString, function(err, rows, fields) {
   if (!err && rows.length > 0 )
    {    
          var obj= '{"message":"The action was successful","product":[';    
          var result = [];
          for(var i =0; i< rows.length; i++)
          {
              var temp= '{"asin":"'+rows[i].asin+'","productName":"'+rows[i].productName+'"}';
              result.push(temp);
          }
          obj=obj+ result +']}';
          return res.send(obj);
    }            

   else          
    {       
    
      var obj= '{"message":"There are no products that match that criteria"}';
      return res.send(obj);  
	} 
 });
 
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
	console.log("session username" + req.user.username);
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
