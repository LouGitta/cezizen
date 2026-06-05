import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreathingPage } from './breathing.page';
import { BreathingService } from '../../services/breathing.service';
import { StorageService } from 'src/app/services/storage.service';
import { of } from 'rxjs';

describe('BreathingPage', () => {
  let component: BreathingPage;
  let fixture: ComponentFixture<BreathingPage>;
  let breathingSrvSpy: jasmine.SpyObj<BreathingService>;
  let storageSpy: jasmine.SpyObj<StorageService>;

  beforeEach(async () => {
    // Mock our services
    const bSpy = jasmine.createSpyObj('BreathingService', ['getAllExercices']);
    const sSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);

    // Mock API response with dummy exercise data
    bSpy.getAllExercices.and.returnValue(
      of([{ id: 1, name: 'Test 5-5', inhale: 5000, hold: 0, exhale: 5000, is_active: true }])
    );
    sSpy.get.and.returnValue(Promise.resolve(null)); // Mock empty cache

    await TestBed.configureTestingModule({
      imports: [BreathingPage], // Standalone component
      providers: [
        { provide: BreathingService, useValue: bSpy },
        { provide: StorageService, useValue: sSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BreathingPage);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Triggers ngOnInit
  });

  it('doit créer la page', () => {
    expect(component).toBeTruthy();
  });

  it('doit basculer isPlaying sur true quand on clique sur Play', () => {
    // ARRANGE : Ensure exercise is loaded and app is paused
    component.currentExercise = {
      id: 1,
      name: 'Test',
      inhale: 1000,
      hold: 0,
      exhale: 1000,
      is_active: true,
    };
    component.isPlaying = false;

    // ACT : Trigger the button click handler
    component.togglePlay();

    // ASSERT : State should be updated
    expect(component.isPlaying).toBeTrue();
    expect(component.phase).toBe('inhale');
  });

  it('doit arrêter le timer quand on change dexercice', () => {
    // ARRANGE : Mock active exercise
    component.isPlaying = true;
    spyOn(component, 'stopExercise'); // Spy on function

    // ACT : Mock change event from select element
    const fausseSelection = {
      detail: { value: { id: 2, name: 'Nouveau', inhale: 2000, hold: 0, exhale: 2000, is_active: true } },
    };
    component.changeExercise(fausseSelection);

    // ASSERT
    expect(component.stopExercise).toHaveBeenCalled();
    expect(component.isPlaying).toBeFalse();
    expect(component.phase).toBe('inhale');
  });
});
