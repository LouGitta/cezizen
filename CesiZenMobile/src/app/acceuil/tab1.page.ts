import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCol,
  IonGrid,
  IonRow,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForward } from 'ionicons/icons';
import { Articles } from '../services/articlesServices/articles';
import { CommonModule } from '@angular/common';
import { FirstSentencePipe } from '../pipes/firstSentence.pipe';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    FirstSentencePipe,
    IonButton,
    IonIcon,
  ],
})
export class Tab1Page implements OnInit {
  articles: any = [];
  constructor(private articlesSrv: Articles) {
    addIcons({ arrowForward });
  }
  ngOnInit() {
    this.articlesSrv.getAllArticles().subscribe({
      next: (data: any) => (this.articles = data),
    });
  }
}
