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
  IonImg,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, heart, heartOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthServices } from 'src/app/services/authServices/auth-services';
import { StorageService } from 'src/app/services/storage/storage'; // 👈 1. Import du Storage
import { articleServices } from 'src/app/services/articlesServices/articles';

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
    private router: Router,
    private route: ActivatedRoute,
    private storageSrv: StorageService
  ) {
    addIcons({ arrowForwardOutline, heart, heartOutline });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['filter']) {
        this.selectedCategory = params['filter'];
      }
    });
  }

  async ionViewWillEnter() {
    this.isLoggedIn = await this.authSrv.isAuthenticated();

    const articlesSauvegardes = await this.storageSrv.get('offline_articles');
    if (articlesSauvegardes && articlesSauvegardes.length > 0) {
      this.articles = articlesSauvegardes;
      console.log('Articles chargés depuis le cache local !');
    }

    this.articlesSrv.getAllArticles().subscribe({
      next: async (data: any) => {
        this.articles = data;
        await this.storageSrv.set('offline_articles', this.articles);
        console.log('Articles synchronisés avec le serveur et mis en cache !');
      },
      error: (err) => {
        console.warn('📡 Mode hors-ligne actif pour les articles.');
      },
    });
  }

  get filteredArticles() {
    if (this.selectedCategory == 0) {
      return this.articles;
    }
    if (this.selectedCategory === 'favoris') {
      return this.articles.filter(
        (article: any) => article.is_favorite === true
      );
    }

    return this.articles.filter(
      (article: any) => article.category == this.selectedCategory
    );
  }

  async toggleFavorite(event: Event, article: any) {
    event.stopPropagation();

    article.is_favorite = !article.is_favorite;

    await this.storageSrv.set('offline_articles', this.articles);

    this.articlesSrv.toggleFavorite(article.id).subscribe({
      next: async (res: any) => {
        article.is_favorite = res.is_favorite;
        await this.storageSrv.set('offline_articles', this.articles);
      },
      error: async (err) => {
        article.is_favorite = !article.is_favorite;
        await this.storageSrv.set('offline_articles', this.articles);
      },
    });
  }

  goToArticle(id: Number, article: any) {
    this.articlesSrv.readArticle(article);
    this.router.navigate(['/article', id]);
  }
}
