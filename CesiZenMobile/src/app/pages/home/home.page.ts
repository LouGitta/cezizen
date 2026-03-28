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
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthServices } from 'src/app/services/authServices/auth-services';
import { StorageService } from 'src/app/services/storage/storage'; // 👈 1. Import du Storage

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
    private storageSrv: StorageService // 👈 2. Injection du Storage
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

    // 👇 3. OFFLINE : Chargement instantané depuis le téléphone
    const articlesSauvegardes = await this.storageSrv.get('offline_articles');
    if (articlesSauvegardes && articlesSauvegardes.length > 0) {
      this.articles = articlesSauvegardes;
      console.log('📦 Articles chargés depuis le cache local !');
    }

    // 👇 4. ONLINE : Récupération des nouveautés (ou des nouveaux favoris)
    this.articlesSrv.getAllArticles().subscribe({
      next: async (data: any) => {
        this.articles = data;
        // On écrase l'ancien cache avec les données toutes fraîches
        await this.storageSrv.set('offline_articles', this.articles);
        console.log(
          '✅ Articles synchronisés avec le serveur et mis en cache !'
        );
      },
      error: (err) => {
        // En mode avion, on passe ici. L'utilisateur verra quand même ses articles !
        console.warn('📡 Mode hors-ligne actif pour les articles.');
      },
    });
  }

  get filteredArticles() {
    if (this.selectedCategory == 0) {
      // Utilisation de == pour éviter les bugs si "0" est une chaîne
      return this.articles;
    }
    if (this.selectedCategory === 'favoris') {
      return this.articles.filter(
        (article: any) => article.is_favorite === true
      );
    }

    return this.articles.filter(
      (article: any) => article.category == this.selectedCategory // Idem, == pour sécuriser
    );
  }

  async toggleFavorite(event: Event, article: any) {
    event.stopPropagation();

    // Modification visuelle immédiate (Optimistic UI)
    article.is_favorite = !article.is_favorite;

    // 🌟 BONUS : On sauvegarde tout de suite dans le téléphone pour le hors-ligne
    await this.storageSrv.set('offline_articles', this.articles);

    this.articlesSrv.toggleFavorite(article.id).subscribe({
      next: async (res: any) => {
        // Si le serveur valide, on met à jour avec la réponse exacte
        article.is_favorite = res.is_favorite;
        await this.storageSrv.set('offline_articles', this.articles);
      },
      error: async (err) => {
        // Si la requête échoue (ex: perte de réseau au moment du clic),
        // on annule l'action visuellement et on remet le cache à jour
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
