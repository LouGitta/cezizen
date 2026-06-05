import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BreathingExercise } from '../models/breathing-exercise.model';

/**
 * Service managing the retrieval of breathing exercises from the API.
 */
@Injectable({
  providedIn: 'root',
})
export class BreathingService {
  private http = inject(HttpClient);
  private url: string =
    environment.url + environment.apiVersion + 'breathing_excercices/';

  /**
   * Fetches all available breathing exercises from the API.
   * @returns An Observable of BreathingExercise array.
   */
  getAllExercices(): Observable<BreathingExercise[]> {
    return this.http.get<BreathingExercise[]>(this.url);
  }
}
