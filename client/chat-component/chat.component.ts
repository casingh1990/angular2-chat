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

    public uploader:FileUploader = new FileUploader({url:'http://casingh.me:3000/upload',queueLimit: 1,
removeAfterUpload: true});

    constructor() {
        let reference = this;
        let temp;
        let tmp_height;

        this.uploader.onSuccessItem = (item:FileItem, response:string, status:number, headers:ParsedResponseHeaders)
          => { console.log("onSuccessItem " + status, response, item);
        if(response) {
          $("#upload_progress").hide();
          this.resetFormElement($('#file_selector'));
          $('#file_upload_span').css('background-color', '');
        } };

        globalVars.socket.on("broadcastToAll_chatMessage", function(resObj) {
            reference.msgCount++;
            let html = false;
            let embed;

            resObj.msg = resObj.msg.trim();

            if (!resObj.msg){
              return;
            }

            let text = true;

            if ( (resObj.msg.toLowerCase().indexOf("https://www.youtube.com/watch?v=") == 0)
              || (resObj.msg.toLowerCase().indexOf("https://youtu.be/") == 0) ) {
                text = false;
                if ((resObj.msg.toLowerCase().indexOf("https://youtu.be/") == 0)){
                  embed = resObj.msg.replace("https://youtu.be/", "https://www.youtube.com/embed/");
                }else{
                  embed = resObj.msg.replace("https://www.youtube.com/watch?v=", "https://www.youtube.com/embed/");
                }
              resObj.msg = '<div class="video_wrapper"><div class="h_iframe"><img class="ratio" src="http://placehold.it/16x9" frameborder="0" allowfullscreen/>'
              + '<iframe src="' + embed + '" frameborder="0" allowfullscreen></iframe></div></div>';
            }

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
                reference.notifyMe(resObj.msg.substring(0,30));
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

    notifyMe(msg) {
      // Let's check if the browser supports notifications
      if (!("Notification" in window)) {
        //alert("This browser does not support desktop notification");
      }

      // Let's check whether notification permissions have already been granted
      else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(msg);
      }

      // Otherwise, we need to ask the user for permission
      else if (Notification.permission !== "denied") {
        Notification.requestPermission(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            var notification = new Notification(msg);
          }
        });
      }

      // At last, if the user has denied notifications, and you
      // want to be respectful there is no need to bother them any more.
    }

    sendMessage(data) {
        this.resFlag = true;
        let reference = this;
        //alert(reference.uploader.queue[0].file.name);
        data.value = $("<div/>").html(data.value).text();
        let i=0;
        for (i=0;i<reference.uploader.queue.length; i++){
          data.value += " <a target=\"blank\" href=\"/file/" + reference.uploader.queue[i].file.name + "\">" + reference.uploader.queue[i].file.name "</a><br />";
        }
        globalVars.socket.emit("chatMessageToSocketServer", data.value, function(respMsg, username){
            reference.sentMessageUsername = username;
            reference.response = respMsg;
        });
        $("#message-boxID").val(" ");
        $("#upload_progress").show();
        reference.uploader.uploadAll();
    }

    resetFormElement(e) {
      e.wrap('<form>').closest('form').get(0).reset();
      e.unwrap();
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
