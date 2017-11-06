"use strict";
let express = require("express");
var path = require('path');
let chat_app = require('express')();
var bodyParser = require('body-parser');
var multer = require('multer');
let http = require('http').Server(chat_app);
let io = require('socket.io')(http);
let clientListNames = [];

chat_app.use(express.static(__dirname, '/'));
chat_app.use(express.static(__dirname, '/server/'));
chat_app.use(express.static(__dirname + "/..", '/client/'));
chat_app.use(express.static(__dirname + '/node_modules'));
chat_app.use(bodyParser.json());

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, '../uploads/');
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.originalname);// + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});



var upload = multer({ //multer settings
                storage: storage
            }).single('file');

/** API path that will upload the files */
chat_app.post('/upload', function(req, res) {
    upload(req,res,function(err){
        console.log(req.file.path);
        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }

         let name = "";
         let url_text = '<a href="/file/' + req.file.originalname + '">' + req.file.originalname + '</a>';
         //let sockectObj = {name, url};
         res.json({error_code:0,err_desc:null,url:url_text});
     		//io.emit('broadcastToAll_chatMessage', sockectObj);
    });
});

chat_app.get('/file/:name', function(req, res) {
  var options = {
    root: '../uploads/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };
  var fileName = req.params.name;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Sent:', fileName);
    }
  });
});

chat_app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

chat_app.get('/chat', function(req, res){
	res.redirect('/');
});

chat_app.use(function(req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://casingh.me:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

io.on('connection', function(socket){
	clientListNames.push(socket.handshake.query.userName);
	io.emit("updateSocketList", clientListNames);
	io.emit("addUserToSocketList",socket.handshake.query.userName);

	socket.on('disconnect', function(){
		let name=socket.handshake.query.userName;
		let userIndex = clientListNames.indexOf(socket.handshake.query.userName);
		 if (userIndex != -1) {
		 	clientListNames.splice(userIndex, 1);
			io.emit("updateSocketList", clientListNames);
			io.emit("removeUserFromSocketList",name);
		 }
  	});

	socket.on('chatMessageToSocketServer', function(msg, func){
		func("Message recieved!",socket.handshake.query.userName);
		let name = socket.handshake.query.userName;
		let sockectObj = {name,msg}
		io.emit('broadcastToAll_chatMessage', sockectObj);
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
