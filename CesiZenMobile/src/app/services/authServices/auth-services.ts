import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage/storage';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  public isLoggedIn$ = new BehaviorSubject<boolean>(false);
  private url: string = environment.url + environment.authUrl;
  constructor(
    private http: HttpClient,
    private storageSrv: StorageService,
  ) {
    this.checkTokenOnLoad();
  }

  private async checkTokenOnLoad() {
    const token = await this.storageSrv.get('access_token');
    if (token) {
      console.log('Token trouvé au démarrage, reconnexion auto !');
      this.isLoggedIn$.next(true);
    }
  }

  login(user: any): Observable<any> {
    return this.http.post(this.url + 'login/', user).pipe(
      tap(async (response: any) => {
        if (response && response.access) {
          await this.storageSrv.set('access_token', response.access);
          await this.storageSrv.set('refresh_token', response.refresh);
          this.isLoggedIn$.next(true);
        }
      }),
    );
  }

  async logout() {
    await this.storageSrv.remove('access_token');
    await this.storageSrv.remove('refresh_token');

    this.isLoggedIn$.next(false);
  }

  register(user: any): Observable<any> {
    return this.http.post(this.url + 'register/', user);
  }
}
