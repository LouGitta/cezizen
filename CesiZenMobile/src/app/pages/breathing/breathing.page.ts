import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
  IonTitle,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { BreathingService } from '../../services/breathing.service';
import { FormsModule } from '@angular/forms';
import { pause, play, arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { BreathingExercise } from 'src/app/models/breathing-exercise.model';

/**
 * Component for the Breathing Exercises page.
 * Implements a cyclic inhale-hold-exhale timer with animations.
 */
@Component({
  selector: 'app-breathing',
  templateUrl: 'breathing.page.html',
  styleUrls: ['breathing.page.scss'],
  standalone: true,
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
    IonTitle,
    IonMenuButton,
  ],
})
export class BreathingPage implements OnInit, OnDestroy {
  private exerciseSrv = inject(BreathingService);
  private router = inject(Router);
  private storageSrv = inject(StorageService);

  exercises: BreathingExercise[] = [];
  currentExercise: BreathingExercise | null = null;
  isPlaying: boolean = false;
  phase: 'inhale' | 'hold' | 'exhale' = 'inhale';
  counter: number = 0;
  private timer: any;

  constructor() {
    addIcons({ play, pause, arrowBack });
  }

  /**
   * Initializes the list of exercises from storage (offline cache) and syncs them from the API.
   */
  async ngOnInit(): Promise<void> {
    const offlineExercises = await this.storageSrv.get('offline_breathing');

    if (offlineExercises && offlineExercises.length > 0) {
      this.exercises = offlineExercises;
      this.currentExercise = this.exercises[0];
    }

    this.exerciseSrv.getAllExercices().subscribe({
      next: async (data) => {
        this.exercises = data;

        if (!this.currentExercise || !offlineExercises) {
          this.currentExercise = this.exercises[0];
        }

        await this.storageSrv.set('offline_breathing', data);
      },
      error: (err) => {
        console.warn('📡 Mode hors-ligne actif pour les exercices de respiration.', err);
      },
    });
  }

  /**
   * Toggles play/pause state of the current exercise.
   */
  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.startExercise();
    } else {
      this.stopExercise();
    }
  }

  /**
   * Triggered when a new exercise is selected.
   * @param event The selection change event.
   */
  changeExercise(event: any): void {
    this.stopExercise();
    this.isPlaying = false;
    this.currentExercise = event.detail.value;
    this.phase = 'inhale';
  }

  /**
   * Starts the cycle of the breathing exercise.
   */
  startExercise(): void {
    if (!this.currentExercise) return;
    this.phase = 'inhale';
    this.counter = this.currentExercise.inhale / 1000;

    this.timer = setInterval(() => {
      if (this.counter > 1) {
        this.counter--;
      } else {
        this.nextPhase();
      }
    }, 1000);
  }

  /**
   * Stops the active exercise timer.
   */
  stopExercise(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * Advances the breathing exercise cycle to the next phase (inhale -> hold -> exhale -> inhale).
   */
  nextPhase(): void {
    if (!this.currentExercise) return;

    if (this.phase === 'inhale') {
      if (this.currentExercise.hold > 0) {
        this.phase = 'hold';
        this.counter = this.currentExercise.hold / 1000;
      } else {
        this.phase = 'exhale';
        this.counter = this.currentExercise.exhale / 1000;
      }
    } else if (this.phase === 'hold') {
      this.phase = 'exhale';
      this.counter = this.currentExercise.exhale / 1000;
    } else {
      this.phase = 'inhale';
      this.counter = this.currentExercise.inhale / 1000;
    }
  }

  /**
   * Returns display-friendly French text for the current breathing phase.
   */
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

  /**
   * Returns the transition duration in CSS string format for breathing circle animation.
   */
  getTransitionDuration(): string {
    if (!this.isPlaying || !this.currentExercise) return '500ms';
    if (this.phase === 'inhale') return `${this.currentExercise.inhale}ms`;
    if (this.phase === 'hold') return '500ms';
    return `${this.currentExercise.exhale}ms`;
  }

  ngOnDestroy(): void {
    this.stopExercise();
  }

  /**
   * Stops the exercise and routes the user back to home page.
   */
  retourHub(): void {
    this.stopExercise();
    this.isPlaying = false;
    this.phase = 'inhale';

    this.router.navigate(['/home']);
  }

  ionViewWillEnter(): void {
    const tabBar = document.querySelector('ion-tab-bar');
    if (tabBar) tabBar.style.display = 'none';
  }

  ionViewWillLeave(): void {
    const tabBar = document.querySelector('ion-tab-bar');
    if (tabBar) tabBar.style.display = 'flex';
  }

  /**
   * Helper function for ion-select object comparison.
   */
  compareExercises(e1: BreathingExercise | null, e2: BreathingExercise | null): boolean {
    return e1 && e2 ? e1.id === e2.id : e1 === e2;
  }
}
