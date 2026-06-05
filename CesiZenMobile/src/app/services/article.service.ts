import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Article } from '../models/article.model';

/**
 * Service managing article and blog post retrieval as well as favorite interactions.
 */
@Injectable({
  providedIn: 'root',
 })
export class ArticleService {
  private http = inject(HttpClient);
  private url: string = environment.url + environment.apiVersion + 'articles';
  private article: Article | null = null;

  /**
   * Fetches all articles from the API.
   * @returns An Observable of Article array.
   */
  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.url);
  }

  /**
   * Retrieves the currently active article from the local state.
   * @returns The active Article or null.
   */
  getArticle(): Article | null {
    return this.article;
  }

  /**
   * Sets the active article in the local state.
   * @param newArticle The article to set.
   */
  readArticle(newArticle: Article): void {
    this.article = newArticle;
  }

  /**
   * Cleans the active article state.
   */
  leaveArticle(): void {
    this.article = null;
  }

  /**
   * Toggles the favorite status of an article.
   * @param articleId The ID of the article to toggle favorite status for.
   * @returns An Observable with the updated favorite status response.
   */
  toggleFavorite(articleId: number): Observable<{ status: string; is_favorite: boolean }> {
    return this.http.post<{ status: string; is_favorite: boolean }>(`${this.url}/${articleId}/favorite/`, {});
  }
}
