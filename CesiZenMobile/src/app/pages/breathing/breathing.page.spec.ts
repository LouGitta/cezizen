import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreathingPage } from './breathing.page';
import { BreathingServices } from '../../services/breathingServices/breathing-services';
import { StorageService } from 'src/app/services/storage/storage';
import { of } from 'rxjs';

describe('BreathingPage', () => {
  let component: BreathingPage;
  let fixture: ComponentFixture<BreathingPage>;
  let breathingSrvSpy: jasmine.SpyObj<BreathingServices>;
  let storageSpy: jasmine.SpyObj<StorageService>;

  beforeEach(async () => {
    // On simule nos services
    const bSpy = jasmine.createSpyObj('BreathingServices', ['getAllExercices']);
    const sSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);

    // On simule une réponse de l'API avec un exercice factice
    bSpy.getAllExercices.and.returnValue(
      of([{ id: 1, name: 'Test 5-5', inhale: 5000, hold: 0, exhale: 5000 }])
    );
    sSpy.get.and.returnValue(Promise.resolve(null)); // On simule un cache vide

    await TestBed.configureTestingModule({
      imports: [BreathingPage], // Car c'est un composant Standalone
      providers: [
        { provide: BreathingServices, useValue: bSpy },
        { provide: StorageService, useValue: sSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BreathingPage);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Déclenche le ngOnInit
  });

  it('doit créer la page', () => {
    expect(component).toBeTruthy();
  });

  it('doit basculer isPlaying sur true quand on clique sur Play', () => {
    // ARRANGE : On s'assure que l'exercice est bien chargé et que l'appli est sur Pause
    component.currentExercice = {
      name: 'Test',
      inhale: 1000,
      hold: 0,
      exhale: 1000,
    };
    component.isPlaying = false;

    // ACT : On appelle la fonction déclenchée par le bouton HTML
    component.togglePlay();

    // ASSERT : L'état a dû changer
    expect(component.isPlaying).toBeTrue();
    expect(component.phase).toBe('inhale');
  });

  it('doit arrêter le timer quand on change dexercice', () => {
    // ARRANGE : On simule un exercice en cours
    component.isPlaying = true;
    spyOn(component, 'stopExercise'); // On "espionne" cette fonction pour voir si elle est appelée

    // ACT : On simule le changement dans la liste déroulante
    const fausseSelection = {
      detail: { value: { name: 'Nouveau', inhale: 2000 } },
    };
    component.changerExercice(fausseSelection);

    // ASSERT
    expect(component.stopExercise).toHaveBeenCalled();
    expect(component.isPlaying).toBeFalse();
    expect(component.phase).toBe('inhale');
  });
});
