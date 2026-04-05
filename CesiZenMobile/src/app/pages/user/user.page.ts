import { Router, RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonAvatar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonCard,
  IonButtons,
  IonCheckbox,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eye,
  eyeOff,
  settingsOutline,
  flame,
  time,
  heart,
  statsChart,
  notifications,
  logOutOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { AuthServices } from 'src/app/services/authServices/auth-services';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-user',
  templateUrl: 'user.page.html',
  styleUrls: ['user.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    FormsModule,
    IonButton,
    IonIcon,
    IonAvatar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonCard,
    IonButtons,
    RouterModule,
    IonCheckbox,
  ],
})
export class UserPage {
  username: string = 'lou';
  // email: string = '';
  password: string = 'abcd';
  passwordConfirm: string = '';
  showPassword: boolean = false;
  isLoggedIn: boolean = false;
  authMode: 'login' | 'register' = 'login';
  errorMessage: string = '';
  rgpdAccepted: boolean = false;

  constructor(
    private authSrv: AuthServices,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({
      eye,
      eyeOff,
      settingsOutline,
      flame,
      time,
      heart,
      statsChart,
      notifications,
      logOutOutline,
      alertCircleOutline,
    });
  }

  async ngOnInit() {
    this.isLoggedIn = await this.authSrv.isAuthenticated();
  }

  async ionViewWillEnter() {
    console.log(await this.authSrv.isAuthenticated());
    this.isLoggedIn = await this.authSrv.isAuthenticated();
  }

  seConnecter() {
    this.errorMessage = '';
    if (!this.username || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }
    const user = { username: this.username, password: this.password };
    this.authSrv.login(user).subscribe({
      next: (response) => {
        console.log('Connexion réussie !', response);
        this.password = '';
        this.passwordConfirm = '';
        this.isLoggedIn = true;
      },
      error: (err) => {
        console.error('Erreur :', err);
        if (err.status === 401) {
          this.errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
        } else {
          this.errorMessage = 'Impossible de joindre le serveur.';
        }
      },
    });
  }

  sInscrire() {
    this.errorMessage = '';
    if (!this.rgpdAccepted) {
      this.errorMessage =
        'Vous devez accepter les conditions RGPD pour créer un compte.';
      return; // On stoppe la fonction ici, on n'envoie rien à l'API
    }

    if (!this.username || !this.password || !this.passwordConfirm) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.password !== this.passwordConfirm) {
      this.errorMessage = 'Les mots de passe ne correspondent pas !';
      return;
    }

    const newUser = { username: this.username, password: this.password };

    this.authSrv.register(newUser).subscribe({
      next: (res) => {
        console.log('Compte créé avec succès !', res);
        this.seConnecter();
      },
      error: (err) => {
        console.error("Erreur d'inscription :", err);
        if (err.status === 400 && err.error) {
          this.errorMessage =
            "Ce nom d'utilisateur est déjà utilisé ou invalide.";
        } else {
          this.errorMessage =
            'Une erreur est survenue lors de la création du compte.';
        }
      },
    });
  }

  async seDeconnecter() {
    await this.authSrv.logout();
    this.isLoggedIn = false;
  }

  ouvrirParametres() {
    this.router.navigate(['/settings']);
  }

  async showForgotPasswordAlert() {
    const alert = await this.alertController.create({
      header: 'Réinitialisation',
      message:
        'Pour des raisons de sécurité, veuillez contacter votre administrateur à "support@cesizen.fr" pour réinitialiser votre mot de passe.',
      buttons: ["J'ai compris"],
      cssClass: 'custom-alert-class',
    });

    await alert.present();
  }
}
