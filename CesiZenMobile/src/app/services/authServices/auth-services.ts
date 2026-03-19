import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage/storage';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  private url: string = environment.url + environment.authUrl;

  constructor(private http: HttpClient, private storageSrv: StorageService) {}

  async isAuthenticated(): Promise<boolean> {
    const token = await this.storageSrv.get('access_token');
    return token !== null && token !== undefined;
  }

  login(user: any): Observable<any> {
    return this.http.post(this.url + 'login/', user).pipe(
      tap(async (response: any) => {
        if (response && response.access) {
          await this.storageSrv.set('access_token', response.access);
          await this.storageSrv.set('refresh_token', response.refresh);
        }
      })
    );
  }

  async logout() {
    await this.storageSrv.remove('access_token');
    await this.storageSrv.remove('refresh_token');
  }

  register(user: any): Observable<any> {
    return this.http.post(this.url + 'register/', user);
  }
}
