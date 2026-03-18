import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage/storage';
import { from, switchMap, catchError, of } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🚀 INTERCEPTEUR APPELÉ POUR :', req.url);

  const storageSrv = inject(StorageService);

  return from(storageSrv.get('access_token')).pipe(
    switchMap((token) => {
      if (token) {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        });
        return next(authReq);
      }

      return next(req);
    }),
    catchError((err) => {
      return next(req);
    }),
  );
};
