import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  private url: string = environment.url + environment.authUrl;
  constructor(private http: HttpClient) {}
  seConnecter(user: any): Observable<any> {
    return this.http.post(this.url + 'login/', user);
  }
}
