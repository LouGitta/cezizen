import { TestBed } from '@angular/core/testing';
import { AuthServices } from './auth-services';
import { StorageService } from '../storage/storage';

describe('AuthServices', () => {
  let service: AuthServices;
  let storageSpy: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    // On crée un "faux" StorageService pour ne pas dépendre de la vraie base
    const spy = jasmine.createSpyObj('StorageService', ['get', 'remove']);

    TestBed.configureTestingModule({
      providers: [AuthServices, { provide: StorageService, useValue: spy }],
    });
    service = TestBed.inject(AuthServices);
    storageSpy = TestBed.inject(
      StorageService
    ) as jasmine.SpyObj<StorageService>;
  });

  it('doit retourner true si un token est présent', async () => {
    // Arrange : On simule la présence d'un token dans le storage
    storageSpy.get.and.returnValue(Promise.resolve('mon-super-token'));

    // Act
    const result = await service.isAuthenticated();

    // Assert
    expect(result).toBeTrue();
  });

  it('doit retourner false si aucun token n’existe', async () => {
    // Arrange : On simule l'absence de token
    storageSpy.get.and.returnValue(Promise.resolve(null));

    // Act
    const result = await service.isAuthenticated();

    // Assert
    expect(result).toBeFalse();
  });
});
