import { Router, RouterModule } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
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
  IonMenuButton,
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
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular';
import { UserCredentials } from 'src/app/models/user.model';

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
    IonMenuButton,
  ],
})
/**
 * Component representing the login, registration, and user profile dashboard.
 */
export class UserPage implements OnInit {
  private authSrv = inject(AuthService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  username: string = '';
  password: string = '';
  passwordConfirm: string = '';
  showPassword: boolean = false;
  isLoggedIn: boolean = false;
  authMode: 'login' | 'register' = 'login';
  errorMessage: string = '';
  rgpdAccepted: boolean = false;

  constructor() {
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

  async ngOnInit(): Promise<void> {
    this.isLoggedIn = await this.authSrv.isAuthenticated();
  }

  async ionViewWillEnter(): Promise<void> {
    console.log(await this.authSrv.isAuthenticated());
    this.isLoggedIn = await this.authSrv.isAuthenticated();
  }

  /**
   * Submits login credentials to authenticate the user.
   */
  login(): void {
    this.errorMessage = '';
    if (!this.username || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }
    const user: UserCredentials = { username: this.username, password: this.password };
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

  /**
   * Registers a new user account if RGPD is accepted and passwords match.
   */
  register(): void {
    this.errorMessage = '';
    if (!this.rgpdAccepted) {
      this.errorMessage =
        'Vous devez accepter les conditions RGPD pour créer un compte.';
      return;
    }

    if (!this.username || !this.password || !this.passwordConfirm) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.password !== this.passwordConfirm) {
      this.errorMessage = 'Les mots de passe ne correspondent pas !';
      return;
    }

    const newUser: UserCredentials = { username: this.username, password: this.password };

    this.authSrv.register(newUser).subscribe({
      next: (res) => {
        console.log('Compte créé avec succès !', res);
        this.login();
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

  /**
   * Logs out the user by clearing storage and resetting state.
   */
  async logout(): Promise<void> {
    await this.authSrv.logout();
    this.isLoggedIn = false;
  }

  openSettings(): void {
    this.router.navigate(['/settings']);
  }

  reportIssue(): void {
    window.open('https://github.com/LouGitta/cezizen/issues', '_blank');
  }

  async showForgotPasswordAlert(): Promise<void> {
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
