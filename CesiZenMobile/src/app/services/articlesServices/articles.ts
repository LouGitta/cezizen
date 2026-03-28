import { environment } from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class articleServices {
  private url: string = environment.url + environment.apiVersion + 'articles';
  private article: any = {};

  constructor(private http: HttpClient) {}
  getAllArticles(): Observable<any> {
    return this.http.get(this.url);
  }

  getArticle() {
    return this.article;
  }

  readArticle(newArticle: any) {
    this.article = newArticle;
  }

  leaveArticle() {
    this.article = {};
  }
  toggleFavorite(articleId: number): Observable<any> {
    return this.http.post(`${this.url}/${articleId}/favorite/`, {});
  }
}
