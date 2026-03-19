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
import { AuthServices } from 'src/app/services/authServices/auth-services';

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
  isLoggedIn: boolean = false;
  constructor(
    private articlesSrv: articleServices,
    private authSrv: AuthServices,
    private router: Router
  ) {
    addIcons({ arrowForwardOutline, heart, heartOutline });
  }

  ngOnInit() {}

  async ionViewWillEnter() {
    this.articlesSrv.getAllArticles().subscribe({
      next: (data: any) => (this.articles = data),
    });
    this.isLoggedIn = await this.authSrv.isAuthenticated();
  }

  get filteredArticles() {
    if (this.selectedCategory === 0) {
      return this.articles;
    }
    console.log(this.selectedCategory);
    if (this.selectedCategory === 'favoris') {
      return this.articles.filter(
        (article: any) => article.is_favorite === true
      );
    }

    return this.articles.filter(
      (article: any) => article.category === this.selectedCategory
    );
  }
  toggleFavorite(event: Event, article: any) {
    event.stopPropagation();
    article.is_favorite = !article.is_favorite;

    this.articlesSrv.toggleFavorite(article.id).subscribe({
      next: (res: any) => {
        article.is_favorite = res.is_favorite;
      },
      error: (err) => {
        article.is_favorite = !article.is_favorite;
      },
    });
  }

  goToArticle(id: Number, article: any) {
    this.articlesSrv.readArticle(article);
    this.router.navigate(['/article', id]);
  }
}
