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
import { articleServices } from '../../services/articlesServices/articles';
import { CommonModule } from '@angular/common';
import { FirstSentencePipe } from '../../pipes/firstSentence.pipe';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
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
export class HomePage implements OnInit {
  articles: any = [];
  constructor(private articlesSrv: articleServices) {
    addIcons({ arrowForward });
  }
  ngOnInit() {
    this.articlesSrv.getAllArticles().subscribe({
      next: (data: any) => (this.articles = data),
    });
  }
}
