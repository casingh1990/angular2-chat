import { Component } from "@angular/core";
import * as globalVars from "../service/global";
import { FileUploader } from 'ng2-file-upload';

/// <reference path="../../typings/globals/jquery/index.d.ts/>


import "/socket.io/socket.io.js";


@Component({
  moduleId: module.id,
  selector: "chat-page",
  templateUrl: "./chat.component.html"
})

export class ChatComponent {
    reference: any;
    resFlag: boolean = false;
    newUser: boolean = false;
    exitedUser: boolean = false;
    newUserName: string = null;
    exitedUserName: string = null;
    sentMessageUsername: string = null;
    response: string;
    clientsNameList: number[];
    message: string;
    msgCount: number = 0;

    public uploader:FileUploader = new FileUploader({url:'http://casingh.me:3000/upload'});

    constructor() {
        let reference = this;
        let temp;
        let tmp_height;

        this.uploader.onSuccessItem = (item:FileItem, response:string, status:number, headers:ParsedResponseHeaders)
          => { console.log("onSuccessItem " + status, response, item);
        if(response) {
          let data = {value:response.url};
          //this.sendMessage(data);
        } };

        globalVars.socket.on("broadcastToAll_chatMessage", function(resObj) {
            reference.msgCount++;
            let html = false;
            if (reference.sentMessageUsername !== resObj.name) {
                resObj.name = resObj.name + ": ";
                temp = $("#messages").length;
                console.log("ul length : ", temp);
                console.log(reference.msgCount);
                $("#messages").append($("<li data-index=" + reference.msgCount + ">"));
                $("li[data-index=" + reference.msgCount + "]").append($("<div class='left-msg' data-index=" + reference.msgCount + ">"));
                $("div[data-index=" + reference.msgCount + "]").append($("<span class='name'>").text(resObj.name));
                $("div[data-index=" + reference.msgCount + "]").append($("<span class='msg'>").html(resObj.msg));
                $("#messages").append($("<br>"));
            }
            else if (reference.sentMessageUsername === resObj.name) {
                $("#messages").append($("<li data-index=" + reference.msgCount + ">"));
                $("li[data-index=" + reference.msgCount + "]").append($("<div class='right-msg' data-index=" + reference.msgCount + ">"));
                $("div[data-index=" + reference.msgCount + "]").append($("<span class='msg'>").html(resObj.msg));
                 $("#messages").append($("<br>"));
                reference.sentMessageUsername = null;
            }
            /*tmp_height = $("#messages").scrollTop;
            $("#messages").scrollTop = $("#messages").scrollHeight - $("#messages").clientHeight;
            alert(tmp_height + "\n" $("#messages").scrollTop);*/
            $('#chat_box_id').animate({scrollTop: $('#chat_box_id').prop('scrollHeight')});
        });

        globalVars.socket.on("updateSocketList", function(list){
          reference.clientsNameList = list;
        });

        globalVars.socket.on("addUserToSocketList", function(username){
            reference.exitedUser = false;
            reference.newUser = true;
            reference.newUserName = username;
        });

        globalVars.socket.on("removeUserFromSocketList", function(username){
            reference.newUser = false;
            reference.exitedUser = true;
            reference.exitedUserName = username;
        });
    }


    sendMessage(data) {
        this.resFlag = true;
        let reference = this;
        //alert(reference.uploader.queue[0].file.name);
        data.value = $("<div/>").html(data.value).text();
        let i=0;
        for (i=0;i<reference.uploader.queue.length; i++){
          data.value += "<a href=\"/file/" + reference.uploader.queue[i].file.name + "\">" + reference.uploader.queue[i].file.name "</a><br />";
        }
        globalVars.socket.emit("chatMessageToSocketServer", data.value, function(respMsg, username){
            reference.sentMessageUsername = username;
            reference.response = respMsg;
        });
        $("#message-boxID").val(" ");
        reference.uploader.uploadAll();
    }

    sendMessageOnEnter($event, messagebox) {
        if ($event.which === 13) { // ENTER_KEY
            this.sendMessage(messagebox);
        }
    }

    update() {
        this.resFlag = false;
        this.newUser = false;
        this.exitedUser = false;
    }
}
