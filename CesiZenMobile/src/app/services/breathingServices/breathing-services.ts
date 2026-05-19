import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BreathingServices {
  private http = inject(HttpClient);

  private url: string =
    environment.url + environment.apiVersion + 'breathing_excercices/';

  getAllExercices(): Observable<any> {
    return this.http.get(this.url);
  }
}
