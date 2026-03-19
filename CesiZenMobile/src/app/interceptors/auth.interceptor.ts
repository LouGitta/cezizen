import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpBackend,
  HttpClient,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage/storage';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const httpBackend = inject(HttpBackend);
  const http = new HttpClient(httpBackend);

  const storageSrv = inject(StorageService);

  return from(storageSrv.get('access_token')).pipe(
    switchMap((token) => {
      let authReq = req;
      if (token) {
        authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        });
        return next(authReq);
      }

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
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
                  return http.post(refreshUrl, { refresh: refreshToken }).pipe(
                    switchMap((res: any) => {
                      storageSrv.set('access_token', res.access);
                      if (res.refresh)
                        storageSrv.set('refresh_token', res.refresh);
                      const retriedReq = req.clone({
                        headers: req.headers.set(
                          'Authorization',
                          `Bearer ${res.access}`
                        ),
                      });
                      return next(retriedReq);
                    }),

                    catchError((refreshErr) => {
                      storageSrv.remove('access_token');
                      storageSrv.remove('refresh_token');

                      // router.navigate(['/tabs/user']);

                      return throwError(() => refreshErr);
                    })
                  );
                }
                return throwError(() => error);
              })
            );
          }
          return throwError(() => error);
        })
      );
    })
  );
};
