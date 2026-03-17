import { Component, EnvironmentInjector, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, pauseCircle, personCircle } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor(private navCtrl: NavController) {
    addIcons({ home, pauseCircle, personCircle });
  }
  goToBreathing() {
    this.navCtrl.navigateForward('/breathing', { animated: false });
  }
}
