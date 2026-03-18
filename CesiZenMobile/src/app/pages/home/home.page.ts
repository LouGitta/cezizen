import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButtons,
  IonImg,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, heart, heartOutline } from 'ionicons/icons';
import { articleServices } from '../../services/articlesServices/articles';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    FormsModule,
    IonButtons,
    IonImg,
  ],
})
export class HomePage implements OnInit {
  articles: any = [];
  selectedCategory: any = 0;
  constructor(
    private articlesSrv: articleServices,
    private router: Router,
  ) {
    addIcons({ arrowForwardOutline, heart, heartOutline });
  }
  ngOnInit() {
    this.articlesSrv.getAllArticles().subscribe({
      next: (data: any) => (this.articles = data),
    });
  }
  get filteredArticles() {
    if (this.selectedCategory === 0) {
      return this.articles;
    }
    if (this.selectedCategory === 'favoris') {
      return this.articles.filter(
        (article: any) => article.is_favorite === true,
      );
    }

    return this.articles.filter(
      (article: any) => article.category === this.selectedCategory,
    );
  }
  toggleFavorite(event: Event, article: any) {
    event.stopPropagation();
    article.is_favorite = !article.is_favorite;

    this.articlesSrv.toggleFavorite(article.id).subscribe({
      next: (res: any) => {
        console.log('Favori synchronisé avec Django !', res);
        article.is_favorite = res.is_favorite;
      },
      error: (err) => {
        console.error('Erreur de synchronisation :', err);
        article.is_favorite = !article.is_favorite;
      },
    });
  }

  goToArticle(id: Number, article: any) {
    this.articlesSrv.readArticle(article);
    this.router.navigate(['/article', id]);
  }
}
