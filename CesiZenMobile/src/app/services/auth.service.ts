import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';
import { UserCredentials, AuthResponse, User } from '../models/user.model';

/**
 * Service managing user authentication, registration, token storage, and profile updates.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private storageSrv = inject(StorageService);
  private authUrl: string = environment.url + environment.authUrl;
  private apiUrl: string = environment.url + environment.apiVersion;

  /**
   * Checks whether the user is authenticated based on storage tokens.
   * @returns A Promise resolving to a boolean.
   */
  async isAuthenticated(): Promise<boolean> {
    const accessToken = await this.storageSrv.get('access_token');
    const refreshToken = await this.storageSrv.get('refresh_token');

    const hasAccess = accessToken !== null && accessToken !== undefined;
    const hasRefresh = refreshToken !== null && refreshToken !== undefined;

    return hasAccess || hasRefresh;
  }

  /**
   * Sends a request to delete the user's account.
   * @returns An Observable.
   */
  deleteAccount(): Observable<{ message?: string; error?: string }> {
    return this.http.delete<{ message?: string; error?: string }>(this.apiUrl + 'users/me/');
  }

  /**
   * Sends a patch request to update the user profile info.
   * @param data Partial user profile details (username, current_password, new_password).
   * @returns An Observable.
   */
  updateProfile(data: { username?: string; current_password?: string; new_password?: string }): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(this.apiUrl + 'users/update_me/', data);
  }

  /**
   * Authenticates a user with credentials.
   * @param user User login credentials.
   * @returns An Observable of the AuthResponse.
   */
  login(user: UserCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.authUrl + 'login/', user).pipe(
      tap(async (response: AuthResponse) => {
        if (response && response.access) {
          await this.storageSrv.set('access_token', response.access);
          if (response.refresh) {
            await this.storageSrv.set('refresh_token', response.refresh);
          }
        }
      })
    );
  }

  /**
   * Cleans the session tokens from local storage.
   */
  async logout(): Promise<void> {
    await this.storageSrv.remove('access_token');
    await this.storageSrv.remove('refresh_token');
  }

  /**
   * Registers a new user.
   * @param user Credentials for registration.
   * @returns An Observable of the registration response.
   */
  register(user: UserCredentials): Observable<User> {
    return this.http.post<User>(this.authUrl + 'register/', user);
  }
}
