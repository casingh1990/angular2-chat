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

chat_app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

chat_app.get('/chat', function(req, res){
	res.redirect('/');
});

chat_app.use(function(req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
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
