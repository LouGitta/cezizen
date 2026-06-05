import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonItem,
  IonLabel,
  IonIcon,
  IonAccordionGroup,
  IonAccordion,
  IonButton,
  AlertController,
  ToastController,
  IonList,
  IonInput,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  documentTextOutline,
  shieldCheckmarkOutline,
  informationCircleOutline,
  trashOutline,
  lockClosedOutline,
} from 'ionicons/icons';

import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

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
    IonItem,
    IonLabel,
    IonIcon,
    IonAccordionGroup,
    IonAccordion,
    IonButton,
    IonList,
    IonInput,
    IonMenuButton,
  ],
})
/**
 * Component representing the settings page.
 * Allows updating profile credentials or deleting the account.
 */
export class SettingsPage {
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private authSrv = inject(AuthService);
  private router = inject(Router);

  username: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor() {
    addIcons({
      documentTextOutline,
      shieldCheckmarkOutline,
      informationCircleOutline,
      trashOutline,
      lockClosedOutline,
    });
  }

  /**
   * Validates and submits the profile changes (username and/or password).
   */
  async saveProfile(): Promise<void> {
    const payload: { username?: string; current_password?: string; new_password?: string } = {};

    if (this.username.trim() !== '') {
      payload.username = this.username;
    }

    if (this.newPassword !== '') {
      if (this.newPassword !== this.confirmPassword) {
        this.showToast('Les mots de passe ne correspondent pas', 'danger');
        return;
      }
      if (this.currentPassword === '') {
        this.showToast('Veuillez saisir votre mot de passe actuel', 'warning');
        return;
      }
      payload.current_password = this.currentPassword;
      payload.new_password = this.newPassword;
    }

    if (Object.keys(payload).length === 0) {
      this.showToast('Aucune modification à enregistrer', 'medium');
      return;
    }

    this.authSrv.updateProfile(payload).subscribe({
      next: (res: any) => {
        this.showToast(
          res.message || 'Profil mis à jour avec succès !',
          'success'
        );
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        const errorMsg =
          err.error?.error || 'Une erreur est survenue lors de la mise à jour.';
        this.showToast(errorMsg, 'danger');
      },
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom',
    });
    toast.present();
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
        window.location.replace('/user');
      },
      error: (err) => {
        console.error('Erreur lors de la suppression du compte :', err);
      },
    });
  }
}
