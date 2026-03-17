import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonLabel,
  IonInput,
  IonInputPasswordToggle,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-user',
  templateUrl: 'user.page.html',
  styleUrls: ['user.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonLabel,
    IonInput,
    IonInputPasswordToggle,
    FormsModule,
    IonButton,
  ],
})
export class UserPage {
  username: String = '';
  password: String = '';
  constructor() {}
}
