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
} from 'ionicons/icons';
import { AuthServices } from 'src/app/services/authServices/auth-services';

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
  ],
})
export class UserPage {
  username: string = 'test@cesizen.fr';
  email: string = '';
  password: string = 'MonSuperMotDePasse123!';
  passwordConfirm: string = '';
  showPassword: boolean = false;
  isLoggedIn: boolean = false;
  authMode: 'login' | 'register' = 'login';

  constructor(private authSrv: AuthServices, private router: Router) {
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
    });
  }

  ngOnInit() {}

  async ionViewWillEnter() {
    this.isLoggedIn = await this.authSrv.isAuthenticated();
  }

  seConnecter() {
    const user = { username: this.username, password: this.password };
    this.authSrv.login(user).subscribe({
      next: (response) => {
        console.log('Connexion réussie !', response);
        this.password = '';
        this.username = '';
        this.isLoggedIn = true;
      },
      error: (err) => console.error('Erreur :', err),
    });
  }

  sInscrire() {
    if (this.password !== this.passwordConfirm) {
      console.error('Les mots de passe ne correspondent pas !');
      return;
    }

    const newUser = { username: this.username, password: this.password };

    this.authSrv.register(newUser).subscribe({
      next: (res) => {
        console.log('Compte créé avec succès !', res);
        this.seConnecter();
      },
      error: (err) => console.error("Erreur d'inscription :", err),
    });
  }

  async seDeconnecter() {
    await this.authSrv.logout();
    this.isLoggedIn = false;
  }

  ouvrirParametres() {
    this.router.navigate(['/settings']);
  }
}
