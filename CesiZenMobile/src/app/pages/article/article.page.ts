import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { articleServices } from 'src/app/services/articlesServices/articles';

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
  ],
})
export class ArticlePage implements OnInit {
  router: Router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  articleId: Number = 0;
  article: any = {};
  constructor(private articlesSrv: articleServices) {
    this.article = articlesSrv.getArticle();
  }

  ngOnInit() {
    this.articleId = this.activatedRoute.snapshot.params['id'];
    if (!this.article || !this.article.id) {
      console.log(
        "Article non trouvé en mémoire, on le télécharge depuis l'API...",
      );
    }
  }
}
