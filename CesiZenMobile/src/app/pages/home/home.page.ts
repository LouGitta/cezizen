import { Component, OnInit, inject } from '@angular/core';
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
  IonButtons,
  IonMenuButton,
  IonGrid,
  IonCol,
  IonRow,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, heart, heartOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { ArticleService } from 'src/app/services/article.service';
import { Article } from 'src/app/models/article.model';

/**
 * Component for the Home dashboard.
 * Displays articles, category segments, and navigation to articles.
 */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
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
    IonButtons,
    IonMenuButton,
    IonGrid,
    IonCol,
    IonRow,
  ],
})
export class HomePage implements OnInit {
  private articlesSrv = inject(ArticleService);
  private authSrv = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storageSrv = inject(StorageService);

  articles: Article[] = [];
  selectedCategory: number | string = 0;
  isLoggedIn: boolean = false;

  constructor() {
    addIcons({ arrowForwardOutline, heart, heartOutline });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['filter']) {
        const filterVal = params['filter'];
        // Parse numerical categories or fallback to string (e.g. 'favoris')
        this.selectedCategory = isNaN(Number(filterVal)) ? filterVal : Number(filterVal);
      }
    });
  }

  /**
   * Refreshes authentication status and syncs articles from the API.
   */
  async ionViewWillEnter(): Promise<void> {
    this.isLoggedIn = await this.authSrv.isAuthenticated();

    const offlineArticles = await this.storageSrv.get('offline_articles');
    if (offlineArticles && offlineArticles.length > 0) {
      this.articles = offlineArticles;
      console.log('Articles chargés depuis le cache local !');
    }

    this.articlesSrv.getAllArticles().subscribe({
      next: async (data) => {
        this.articles = data;
        await this.storageSrv.set('offline_articles', this.articles);
        console.log('Articles synchronisés avec le serveur et mis en cache !');
      },
      error: (err) => {
        console.warn('📡 Mode hors-ligne actif pour les articles.', err);
      },
    });
  }

  /**
   * Getter returning articles filtered by the selected category or favorite status.
   */
  get filteredArticles(): Article[] {
    if (this.selectedCategory === 0) {
      return this.articles;
    }
    if (this.selectedCategory === 'favoris') {
      return this.articles.filter(
        (article) => article.is_favorite === true
      );
    }

    return this.articles.filter(
      (article) => article.category === this.selectedCategory
    );
  }

  /**
   * Toggles the favorite status of a specific article.
   * @param event Click event to stop propagation.
   * @param article The article model.
   */
  async toggleFavorite(event: Event, article: Article): Promise<void> {
    event.stopPropagation();

    article.is_favorite = !article.is_favorite;

    await this.storageSrv.set('offline_articles', this.articles);

    this.articlesSrv.toggleFavorite(article.id).subscribe({
      next: async (res) => {
        article.is_favorite = res.is_favorite;
        await this.storageSrv.set('offline_articles', this.articles);
      },
      error: async (err) => {
        console.error('Erreur toggleFavorite API :', err);
        article.is_favorite = !article.is_favorite;
        await this.storageSrv.set('offline_articles', this.articles);
      },
    });
  }

  /**
   * Sets the active article and navigates to the detail page.
   * @param id The article ID.
   * @param article The article model.
   */
  goToArticle(id: number, article: Article): void {
    this.articlesSrv.readArticle(article);
    this.router.navigate(['/article', id]);
  }
}
