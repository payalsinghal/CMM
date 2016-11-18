var express    = require('express');        
var app        = express(); 


var bodyParser = require('body-parser');
var morgan      = require('morgan');
var mongoose   = require('mongoose');

var emailjs   = require('emailjs');


var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var Registration= require('./app/models/reg');
var Login= require('./app/models/login');


// app.use(function(req, res) {
//    res.sendFile(__dirname + '/public/views/login.html');
// });


app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname));
// app.use(function(req, res) {
//    res.sendFile(__dirname + '/public/views/login.html');
// });


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev')); 

var port = 3000; 

// var mongoose   = require('mongoose');
// mongoose.connect('mongodb://localhost/array'); 

mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable


var router = express.Router();             
  

router.get('/', function(req, res) {
    res.send({ message: 'welcome to our api!' });   
});



router.route('/regs').post(function(req,res) {
        
        var registration = new Registration();      
        registration.username = req.body.username;
        registration.phone_no= req.body.phone_no;
         registration.email_id=req.body.email_id;
        

        registration.save(function(err) {
            if (err)
                res.send(err);

            res.send({ message : ' registration done!' });

        });

         var login = new Login();      
        login.email_id = req.body.email_id;
        login.password= req.body.password;

        login.save(function(err) {
        if (err)
                res.send(err);
        
            else
            res.send( { message: 'log'})
    });
    });

 



router.route('/login').post(function(req,res) {

   
   Login.findOne({email_id:req.body.email_id},function(err,d)


    {
              //  if(!err)
        //  {


        // if(d == null)
        //     res.json({message:'user not found'}) 

        //     else if(req.body.email_id == d.email_id && req.body.password == d.password)
            
        //     res.json("user exist");

        
 // User.findOne({
 //    name: req.body.name
 //  }, function(err, user) {

    if (err) throw err;

    if (!d) {
      res.send({ success: false, message: 'Authentication failed. User not found.' });
    } 
    else if (d) {

      if (d.password != req.body.password) {
        res.send({ success: false, message: 'Authentication failed. Wrong password.' });
      } 
      else {

       
        var token = jwt.sign(d, app.get('superSecret'), {
          expiresIn: 1440 // expires in 24 hours
        });

        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });

         Login.update( { email_id: req.body.email_id },  { $set: { token: token }},function(err,email_id){
                 if(err){
                  console.log(err);}
                 else{
                  console.log(email_id)}
                })
       }   
     }   


    })

 });




router.route('/addcontact').post(function(req,res) {

 Login.findOne({token:req.headers.token}, function(err, user) {
           if (err){
            console.log(err);
             res.send(err);
                    }
      else if(user===null||undefined||""){
           res.json("unauthroized");}

      else{

Registration.findOne({email_id:req.body.email_id},function(err,d)
        {
     if(!err)   
          {
            var contact = new Registration();  
            contact.name= req.body.name;
            contact.phone= req.body.phone;
            contact.email= req.body.email;

            Registration.update({email_id:req.body.email_id},{$push:{contact:{name :contact.name,phone:contact.phone,email:contact.email}}},function(err,dd){
            if(err)
                res.send(err);
            else
    
            res.send( { message: 'Add contact'})
            
                                });
          }
    });
    }
 });

});


router.route('/getcontact').post(function(req,res) {
  Login.findOne({token:req.headers.token}, function(err, user) {
           if (err){
            console.log(err);
             res.send(err);
                    }
      else if(user===null||undefined||""){
           res.json("unauthroized");}

      else{

Registration.findOne({email_id:req.body.email_id},function(err,allcontact){
            if(err)
                res.send(err);
            else
    
            res.send( {'success': true,message: 'All contact',data:allcontact})
            
                                });
          }
    });
    });


router.route('/updatecontact').post(function(req,res) {
   Login.findOne({token:req.headers.token}, function(err, user) {
           if (err){
            console.log(err);
             res.send(err);
           }
      else if(user===null||undefined||""){
           res.send("unauthroized");}

           else{

  Registration.findOne({email_id:req.body.email_id},function(err,d)
  {
    
    if(!err)
    {

Registration.update({email_id:req.body.email_id,"contact.email":req.body.email},{$set:{contact:{name : req.body.name,phone:req.body.phone,email:req.body.email}}},function(err,d){
            if(err)
                res.send(err);
            else
    
            res.send( { message: 'update contact'})
    
                    });
    }

    });
}
 });
 });


router.route('/deletecontact').delete(function(req, res) {
 
   Login.findOne({token:req.headers.token}, function(err, user) {
           if (err){
            console.log(err);
             res.json(err);
           }
      else if(user===null||undefined||""){
           res.send("unauthroized");}

           else{

            Registration.update({email_id:req.body.email_id,"contact.email":req.body.email},{$pull:{contact:{email:req.body.email}}}, function(err,deletecontact) {
            if (err)
            {
                res.send(err);
              }
              else

            res.send({ message: 'Successfully deleted' });
          });
     
           } 
        });
    });



router.route('/email').post(function(req,res) {

  // Login.findOne({token:req.headers.token}, function(err, user) {
  //          if (err){
  //           console.log(err);
  //            res.json(err);
  //          }
  //     else if(user===null||undefined||""){
  //          res.json("unauthroized");}

  //          else{

  // Registration.findOne({email_id:req.body.email_id},function(err,d)
  // {
    
  //   if(!err)
  //   {

var server  = emailjs.server.connect({
   user:    req.body.user, 
   password:req.body.password, 
   host:    "smtp.gmail.com", 
   ssl:     true
//    port:465
});
console.log(req.body.user)

console.log(req.body.password)
server.send({
   text:"you can call him/her now", 
   from: req.body.from, 
   to:   req.body.to,
   cc:"",
   subject: "testing emailjs"
}, function (err, message) {

              if(err){                        
               console.log(err)
              }else{
               console.log("email sent")
              }
            });
// });
// }
// });
});

router.route('/friend').post(function(req,res) {
Registration.aggregate([{$match: {email_id: {$in: [req.body.email_id,req.body.email_id2]}}}, {$unwind: "$contact"},{$group: {_id: "$contact.name", count: {$sum: 1}}}, {$match: {count: 2}},{$group:{_id:null,count : {$sum:1}}}],function(err,friend){
// Registration.aggregate([{$match: {email_id: {$in: [req.body.email_id,req.body.email_id2]}}}, {$unwind: "$contact"},{$group: {_id: "$contact.name", count: {$sum: 1}}}, {$match: {count: 2}},{$project: {_id: 1}}],function(err,friend) {
if (err)
            {
                res.send(err);
              }
              else
                console.log(friend)
            res.send({ message: 'number of mutual friends', data :friend });
          


})

});





app.use('/api', router);

app.listen(port);
console.log('Server start on port ' + port);
