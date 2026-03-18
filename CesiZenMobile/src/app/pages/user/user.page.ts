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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';
import { AuthServices } from 'src/app/services/authServices/auth-services';
import { StorageService } from 'src/app/services/storage/storage';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
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
  private authSub!: Subscription;

  constructor(
    private authSrv: AuthServices,
    private storageSrv: StorageService,
  ) {
    addIcons({ eye, eyeOff });
  }

  async ngOnInit() {
    this.authSub = this.authSrv.isLoggedIn$.subscribe((etat) => {
      this.isLoggedIn = etat;
    });
  }
  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  seConnecter() {
    const user = { username: this.username, password: this.password };
    this.authSrv.login(user).subscribe({
      next: () => {
        this.password = '';
        this.username = '';
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
  }
}
