"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var globalVars = require("../service/global");
//import { FileUploader } from 'ng2-file-upload';
/// <reference path="../../typings/globals/jquery/index.d.ts/>
require("/socket.io/socket.io.js");
var ChatComponent = /** @class */ (function () {
    //public uploader:FileUploader = new FileUploader({url:'http://casingh.me:3000/upload'});
    function ChatComponent() {
        this.resFlag = false;
        this.newUser = false;
        this.exitedUser = false;
        this.newUserName = null;
        this.exitedUserName = null;
        this.sentMessageUsername = null;
        this.msgCount = 0;
        var reference = this;
        var temp;
        var tmp_height;
        globalVars.socket.on("broadcastToAll_chatMessage", function (resObj) {
            reference.msgCount++;
            if (reference.sentMessageUsername !== resObj.name) {
                resObj.name = resObj.name + ": ";
                temp = $("#messages").length;
                console.log("ul length : ", temp);
                console.log(reference.msgCount);
                $("#messages").append($("<li data-index=" + reference.msgCount + ">"));
                $("li[data-index=" + reference.msgCount + "]").append($("<div class='left-msg' data-index=" + reference.msgCount + ">"));
                $("div[data-index=" + reference.msgCount + "]").append($("<span class='name'>").text(resObj.name));
                $("div[data-index=" + reference.msgCount + "]").append($("<span class='msg'>").text(resObj.msg));
                $("#messages").append($("<br>"));
            }
            else if (reference.sentMessageUsername === resObj.name) {
                $("#messages").append($("<li data-index=" + reference.msgCount + ">"));
                $("li[data-index=" + reference.msgCount + "]").append($("<div class='right-msg' data-index=" + reference.msgCount + ">"));
                $("div[data-index=" + reference.msgCount + "]").append($("<span class='msg'>").text(resObj.msg));
                $("#messages").append($("<br>"));
                reference.sentMessageUsername = null;
            }
            /*tmp_height = $("#messages").scrollTop;
            $("#messages").scrollTop = $("#messages").scrollHeight - $("#messages").clientHeight;
            alert(tmp_height + "\n" $("#messages").scrollTop);*/
            $('#chat_box_id').animate({ scrollTop: $('#chat_box_id').prop('scrollHeight') });
        });
        globalVars.socket.on("updateSocketList", function (list) {
            reference.clientsNameList = list;
        });
        globalVars.socket.on("addUserToSocketList", function (username) {
            reference.exitedUser = false;
            reference.newUser = true;
            reference.newUserName = username;
        });
        globalVars.socket.on("removeUserFromSocketList", function (username) {
            reference.newUser = false;
            reference.exitedUser = true;
            reference.exitedUserName = username;
        });
    }
    ChatComponent.prototype.sendMessage = function (data) {
        this.resFlag = true;
        var reference = this;
        globalVars.socket.emit("chatMessageToSocketServer", data.value, function (respMsg, username) {
            reference.sentMessageUsername = username;
            reference.response = respMsg;
        });
        $("#message-boxID").val(" ");
    };
    ChatComponent.prototype.sendMessageOnEnter = function ($event, messagebox) {
        if ($event.which === 13) {
            this.sendMessage(messagebox);
        }
    };
    ChatComponent.prototype.update = function () {
        this.resFlag = false;
        this.newUser = false;
        this.exitedUser = false;
    };
    ChatComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "chat-page",
            templateUrl: "./chat.component.html"
        })
    ], ChatComponent);
    return ChatComponent;
}());
exports.ChatComponent = ChatComponent;
