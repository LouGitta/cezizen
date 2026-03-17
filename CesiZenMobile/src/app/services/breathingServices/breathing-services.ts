import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BreathingServices {
  private url: string =
    environment.url + environment.apiVersion + 'breathing_excercice/';

  constructor(private http: HttpClient) {}
  getAllExercices(): Observable<any> {
    return this.http.get(this.url);
  }
}
