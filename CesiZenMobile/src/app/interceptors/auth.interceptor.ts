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

      // 1. On attache le token s'il existe (mais on ne fait pas de return ici !)
      if (token) {
        authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        });
      }

      // 2. On envoie la requête et on écoute la réponse (pour TOUTES les requêtes)
      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // 3. Si erreur 401 (Token expiré)
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

                  // On demande un nouveau token à Django
                  return http.post(refreshUrl, { refresh: refreshToken }).pipe(
                    switchMap((res: any) => {
                      // On sauvegarde les nouveaux tokens
                      storageSrv.set('access_token', res.access);
                      if (res.refresh) {
                        storageSrv.set('refresh_token', res.refresh);
                      }

                      // On relance la requête originale avec le nouveau sésame
                      const retriedReq = req.clone({
                        headers: req.headers.set(
                          'Authorization',
                          `Bearer ${res.access}`
                        ),
                      });

                      console.log(
                        '✅ Requête relancée avec le nouveau token !'
                      );
                      return next(retriedReq);
                    }),

                    catchError((refreshErr) => {
                      // Si le refresh_token est lui aussi périmé, c'est mort.
                      console.error(
                        '❌ Echec du rafraîchissement. Suppression des tokens.'
                      );
                      storageSrv.remove('access_token');
                      storageSrv.remove('refresh_token');

                      // Ici, idéalement, tu pourrais utiliser le Router pour renvoyer au login

                      return throwError(() => refreshErr);
                    })
                  );
                }
                return throwError(() => error);
              })
            );
          }
          // Pour toutes les autres erreurs (404, 500, etc.)
          return throwError(() => error);
        })
      );
    })
  );
};
