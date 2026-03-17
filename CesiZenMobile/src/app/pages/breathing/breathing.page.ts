import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonFooter,
  IonButton,
  IonSelectOption,
  IonSelect,
  IonIcon,
  IonButtons,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { BreathingServices } from '../../services/breathingServices/breathing-services';
import { FormsModule } from '@angular/forms';
import { pause, play, arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-breathing',
  templateUrl: 'breathing.page.html',
  styleUrls: ['breathing.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    FormsModule,
    IonFooter,
    IonButton,
    IonSelectOption,
    IonSelect,
    CommonModule,
    IonIcon,
    IonButtons,
  ],
})
export class BreathingPage implements OnInit {
  exercices: any[] = [];
  currentExercice: any = null;
  isPlaying: boolean = false;
  phase: 'inhale' | 'hold' | 'exhale' = 'inhale';
  counter: number = 0;
  private timer: any;

  constructor(
    private exerciceSrv: BreathingServices,
    private router: Router,
  ) {
    addIcons({ play, pause, arrowBack });
  }

  ngOnInit() {
    this.exerciceSrv.getAllExercices().subscribe({
      next: (data: any) => {
        this.exercices = data;

        if (this.exercices.length > 0) {
          this.currentExercice = this.exercices[0];

          console.log('Exercice par défaut :', this.currentExercice);
        }
      },
      error: (err) => console.error('Erreur de récupération :', err),
    });
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.startExercise();
    } else {
      this.stopExercise();
    }
  }
  changerExercice(event: any) {
    this.stopExercise();
    this.isPlaying = false;
    this.currentExercice = event.detail.value;
    this.phase = 'inhale';
  }

  startExercise() {
    this.phase = 'inhale';
    this.counter = this.currentExercice.inhale / 1000;

    this.timer = setInterval(() => {
      if (this.counter > 1) {
        this.counter--;
      } else {
        this.nextPhase();
      }
    }, 1000);
  }

  stopExercise() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  nextPhase() {
    if (this.phase === 'inhale') {
      if (this.currentExercice.hold > 0) {
        this.phase = 'hold';
        this.counter = this.currentExercice.hold / 1000;
      } else {
        this.phase = 'exhale';
        this.counter = this.currentExercice.exhale / 1000;
      }
    } else if (this.phase === 'hold') {
      this.phase = 'exhale';
      this.counter = this.currentExercice.exhale / 1000;
    } else {
      this.phase = 'inhale';
      this.counter = this.currentExercice.inhale / 1000;
    }
  }
  getPhaseText(): string {
    if (!this.isPlaying) return 'PRÊT';
    switch (this.phase) {
      case 'inhale':
        return 'INSPIRE';
      case 'hold':
        return 'RETIENS';
      case 'exhale':
        return 'EXPIRE';
      default:
        return '';
    }
  }

  getTransitionDuration(): string {
    if (!this.isPlaying || !this.currentExercice) return '500ms';
    if (this.phase === 'inhale') return `${this.currentExercice.inhale}ms`;
    if (this.phase === 'hold') return '500ms';
    return `${this.currentExercice.exhale}ms`;
  }

  ngOnDestroy() {
    this.stopExercise();
  }

  retourHub() {
    this.stopExercise();
    this.isPlaying = false;
    this.phase = 'inhale';

    this.router.navigate(['/tabs/home']);
  }

  ionViewWillEnter() {
    const tabBar = document.querySelector('ion-tab-bar');
    if (tabBar) tabBar.style.display = 'none';
  }
  ionViewWillLeave() {
    const tabBar = document.querySelector('ion-tab-bar');
    if (tabBar) tabBar.style.display = 'flex';
  }
}
