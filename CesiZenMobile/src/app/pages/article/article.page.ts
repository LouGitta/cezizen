import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonSpinner,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from 'src/app/services/article.service';
import { StorageService } from 'src/app/services/storage.service';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { Article } from 'src/app/models/article.model';

@Component({
  selector: 'app-article',
  templateUrl: './article.page.html',
  styleUrls: ['./article.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButtons,
    IonSpinner,
    IonButton,
    IonIcon,
  ],
})
/**
 * Component representing the Article detail page.
 */
export class ArticlePage implements OnInit {
  router: Router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private articlesSrv = inject(ArticleService);
  private storageSrv = inject(StorageService);
  articleId: number = 0;
  article: Article | null = null;

  constructor() {
    addIcons({ heart, heartOutline });
    this.article = this.articlesSrv.getArticle();
  }

  ngOnInit() {
    this.articleId = this.activatedRoute.snapshot.params['id'];
    if (!this.article || !this.article.id) {
      console.log(
        "Article non trouvé en mémoire, on le télécharge depuis l'API..."
      );
    }
  }

  /**
   * Toggles the favorite status of the article, updating both the API and offline storage.
   */
  async toggleFavorite(): Promise<void> {
    if (!this.article || !this.article.id) return;

    this.article.is_favorite = !this.article.is_favorite;

    await this.updateOfflineStorage();

    this.articlesSrv.toggleFavorite(this.article.id).subscribe({
      next: async (res) => {
        if (this.article) {
          this.article.is_favorite = res.is_favorite;
          await this.updateOfflineStorage();
        }
      },
      error: async (err) => {
        console.error('Erreur API Favori :', err);
        if (this.article) {
          this.article.is_favorite = !this.article.is_favorite;
          await this.updateOfflineStorage();
        }
      },
    });
  }

  /**
   * Syncs the current article favorite status to the cached list of articles in storage.
   */
  private async updateOfflineStorage(): Promise<void> {
    if (!this.article) return;
    const offlineArticles: Article[] =
      (await this.storageSrv.get('offline_articles')) || [];

    const index = offlineArticles.findIndex(
      (a: Article) => a.id === this.article!.id
    );

    if (index > -1) {
      offlineArticles[index].is_favorite = this.article.is_favorite;
      await this.storageSrv.set('offline_articles', offlineArticles);
    }
  }
}
