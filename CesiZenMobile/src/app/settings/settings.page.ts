import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonIcon,
  IonAccordionGroup,
  IonAccordion,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  documentTextOutline,
  shieldCheckmarkOutline,
  informationCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButtons,
    IonBackButton,
    IonItem,
    IonLabel,
    IonIcon,
    IonAccordionGroup,
    IonAccordion,
  ],
})
export class SettingsPage {
  constructor() {
    addIcons({
      documentTextOutline,
      shieldCheckmarkOutline,
      informationCircleOutline,
    });
  }
}
