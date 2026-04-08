import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage/storage';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  private authUrl: string = environment.url + environment.authUrl;
  private apiUrl: string = environment.url + environment.apiVersion;

  constructor(private http: HttpClient, private storageSrv: StorageService) {}

  async isAuthenticated(): Promise<boolean> {
    const accessToken = await this.storageSrv.get('access_token');
    const refreshToken = await this.storageSrv.get('refresh_token');

    const hasAccess = accessToken !== null && accessToken !== undefined;
    const hasRefresh = refreshToken !== null && refreshToken !== undefined;

    return hasAccess || hasRefresh;
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(this.apiUrl + 'users/me/');
  }

  updateProfile(data: any) {
    return this.http.patch(this.apiUrl + 'users/update_me/', data);
  }

  login(user: any): Observable<any> {
    return this.http.post(this.authUrl + 'login/', user).pipe(
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
    return this.http.post(this.authUrl + 'register/', user);
  }
}
