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
  IonButton,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  documentTextOutline,
  shieldCheckmarkOutline,
  informationCircleOutline,
  trashOutline,
} from 'ionicons/icons';

import { Router } from '@angular/router';
import { AuthServices } from 'src/app/services/authServices/auth-services';

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
    IonButton,
  ],
})
export class SettingsPage {
  constructor(
    private alertCtrl: AlertController,
    private authSrv: AuthServices,
    private router: Router
  ) {
    addIcons({
      documentTextOutline,
      shieldCheckmarkOutline,
      informationCircleOutline,
      trashOutline,
    });
  }
  async confirmerSuppression() {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer le compte ?',
      message:
        'Cette action est irréversible. Toutes vos données et favoris seront définitivement effacés.',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Oui, supprimer',
          role: 'destructive',
          handler: () => {
            this.executerSuppression();
          },
        },
      ],
    });

    await alert.present();
  }

  async executerSuppression() {
    this.authSrv.deleteAccount().subscribe({
      next: async () => {
        await this.authSrv.logout();
        window.location.replace('/tabs/user');
        // this.router.navigate(['/tabs/user']);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression du compte :', err);
      },
    });
  }
}
