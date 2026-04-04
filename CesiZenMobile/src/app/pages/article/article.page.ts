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
import { articleServices } from 'src/app/services/articlesServices/articles';
import { StorageService } from 'src/app/services/storage/storage';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';

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
export class ArticlePage implements OnInit {
  router: Router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  articleId: Number = 0;
  article: any = {};

  constructor(
    private articlesSrv: articleServices,
    private storageSrv: StorageService
  ) {
    addIcons({ heart, heartOutline });
    this.article = articlesSrv.getArticle();
  }

  ngOnInit() {
    this.articleId = this.activatedRoute.snapshot.params['id'];
    if (!this.article || !this.article.id) {
      console.log(
        "Article non trouvé en mémoire, on le télécharge depuis l'API..."
      );
    }
  }

  async toggleFavorite() {
    if (!this.article || !this.article.id) return;

    this.article.is_favorite = !this.article.is_favorite;

    await this.updateOfflineStorage();

    this.articlesSrv.toggleFavorite(this.article.id).subscribe({
      next: async (res: any) => {
        this.article.is_favorite = res.is_favorite;
        await this.updateOfflineStorage();
      },
      error: async (err) => {
        console.error('Erreur API Favori :', err);
        this.article.is_favorite = !this.article.is_favorite;
        await this.updateOfflineStorage();
      },
    });
  }

  private async updateOfflineStorage() {
    const offlineArticles =
      (await this.storageSrv.get('offline_articles')) || [];

    const index = offlineArticles.findIndex(
      (a: any) => a.id === this.article.id
    );

    if (index > -1) {
      offlineArticles[index].is_favorite = this.article.is_favorite;
      await this.storageSrv.set('offline_articles', offlineArticles);
    }
  }
}
