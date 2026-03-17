import { environment } from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class articleServices {
  private url: string = environment.url + environment.apiUrl + 'article';

  constructor(private http: HttpClient) {}
  getAllArticles(): Observable<any> {
    return this.http.get(this.url);
  }
}
