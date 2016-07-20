var User = require('../model/user');
var config = require('../config/database');
var jwt = require('jwt-simple');
var email   = require("emailjs/email");

var functions = {
    authenticate: function(req, res) {
        User.findOne({
            name: req.body.name
        }, function(err, user){
            if (err) throw err;
            
            if(!user) {
                res.status(403).send({success: false, msg: 'Authentication failed, User not found'});
            }
            
           else {
                user.comparePassword(req.body.password, function(err, isMatch){
                    if(isMatch && !err) {
                        var token = jwt.encode(user, config.secret);
                        res.json({success: true, token: token});
                    } else {
                        return res.status(403).send({success: false, msg: 'Authenticaton failed, wrong password.'});
                    }
                })
            }
            
        })
    },
    addNew: function(req, res){
        if((!req.body.name) || (!req.body.password)){
            console.log(req.body.name);
            console.log(req.body.password);
            
            res.json({success: false, msg: 'Enter all values'});
        }
        else {
            var newUser = User({
                name: req.body.name,
                password: req.body.password
            });
            
            newUser.save(function(err, newUser){
                if (err){
                    res.json({success:false, msg:'Failed to save'})
                }
                
                else {
                    res.json({success:true, msg:'Successfully saved'});
                }
            })
        }
    },
    getinfo: function(req, res){
        if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            var token = req.headers.authorization.split(' ')[1];
            var decodedtoken = jwt.decode(token, config.secret);
            return res.json({success: true, msg: 'hello '+decodedtoken.name});
        }
        else {
            return res.json({success:false, msg: 'No header'});
        }
    },
    sendMail: function(req, res) {
        
var server  = email.server.connect({
   user:    "<your userid here>", 
   password:"<your password here>", 
   host:    "<smtp server>", 
   ssl:     true
});

// send the message and get a callback with an error or details of the message that was sent
server.send({
   text:    "Welcome to my demo app", 
   from:    "<your userid here>", 
   to:      req.body.name,
   subject: "Welcome mail"
}, function(err, message) { 
    if(err)
    console.log(err);
    else
    return res.json({success: true, msg: 'sent'});
});
    }
    
    
}

module.exports = functions;
