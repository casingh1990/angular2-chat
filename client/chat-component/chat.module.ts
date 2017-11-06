import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatComponent } from "./chat.component";
import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';

@NgModule({
    imports: [CommonModule],
    declarations: [ChatComponent, FileSelectDirective],
    exports: [ChatComponent]
})

export class ChatModule {
}
