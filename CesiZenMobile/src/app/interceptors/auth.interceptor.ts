import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpBackend,
  HttpClient,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthResponse } from '../models/user.model';

/**
 * Functional HTTP Interceptor that attaches the JWT Access Token to outbound requests
 * and handles automatic token refresh if a 401 Unauthorized error is intercepted.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const httpBackend = inject(HttpBackend);
  const http = new HttpClient(httpBackend);
  const storageSrv = inject(StorageService);
  const router = inject(Router);

  return from(storageSrv.get('access_token')).pipe(
    switchMap((token) => {
      let authReq = req;

      // 1. Attach authorization token if it exists
      if (token) {
        authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        });
      }

      // 2. Send request and intercept potential errors
      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // 3. If unauthorized (401) and not already a login or refresh request
          if (
            error.status === 401 &&
            !req.url.includes('login') &&
            !req.url.includes('refresh')
          ) {
            console.log('🔄 Token périmé ! Tentative de rafraîchissement...');

            return from(storageSrv.get('refresh_token')).pipe(
              switchMap((refreshToken) => {
                if (refreshToken) {
                  const refreshUrl =
                    environment.url + environment.authUrl + 'refresh/';

                  // Ask Django REST for a new pair of tokens
                  return http.post<AuthResponse>(refreshUrl, { refresh: refreshToken }).pipe(
                    switchMap((res: AuthResponse) => {
                      // Save new tokens
                      storageSrv.set('access_token', res.access);
                      if (res.refresh) {
                        storageSrv.set('refresh_token', res.refresh);
                      }

                      // Retry the original request with the new access token
                      const retriedReq = req.clone({
                        headers: req.headers.set(
                          'Authorization',
                          `Bearer ${res.access}`
                        ),
                      });

                      console.log('✅ Requête relancée avec le nouveau token !');
                      return next(retriedReq);
                    }),

                    catchError((refreshErr) => {
                      // If the refresh token is also invalid/expired, log out and redirect
                      console.error(
                        '❌ Echec du rafraîchissement. Suppression des tokens.'
                      );
                      storageSrv.remove('access_token');
                      storageSrv.remove('refresh_token');

                      // Redirect user to the login/auth page
                      router.navigate(['/user']);

                      return throwError(() => refreshErr);
                    })
                  );
                }
                return throwError(() => error);
              })
            );
          }
          // For any other errors (404, 500, etc.)
          return throwError(() => error);
        })
      );
    })
  );
};

