from rest_framework import status
from .base import BaseAPITestCase
from ..models import Article


class ArticleTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()

    def test_list_articles(self):
        """Vérifie que n'importe qui peut voir les articles"""
        self.client.logout()
        response = self.client.get("/api/v1/articles/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_article(self):
        """Vérifie la récupération d'un article spécifique (Read)"""
        self.client.logout()
        url = f"/api/v1/articles/{self.article.id}/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Le pouvoir du moment présent")

    def test_article_create_admin_allowed(self):
        """Un administrateur PEUT créer un article"""
        self.client.force_authenticate(user=self.admin)
        payload = {
            "title": "Article Officiel",
            "content": "Contenu validé...",
            "category": self.category.id,
        }
        response = self.client.post("/api/v1/articles/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_article_create_user_forbidden(self):
        """Un utilisateur standard NE PEUT PAS créer d'article"""
        self.client.force_authenticate(user=self.user)
        payload = {
            "title": "Hack",
            "content": "Je pirate le blog",
            "category": self.category.id,
        }
        response = self.client.post("/api/v1/articles/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_article(self):
        """Vérifie la modification d'un article (Update)"""
        self.client.force_authenticate(user=self.admin)
        url = f"/api/v1/articles/{self.article.id}/"
        payload = {"title": "Titre Modifié"}
        response = self.client.patch(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.article.refresh_from_db()
        self.assertEqual(self.article.title, "Titre Modifié")

    def test_delete_article_admin_allowed(self):
        """Vérifie la suppression d'un article (Delete)"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(f"/api/v1/articles/{self.article.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Article.objects.count(), 0)

    def test_article_delete_user_forbidden(self):
        """Un utilisateur standard NE PEUT PAS supprimer un article"""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f"/api/v1/articles/{self.article.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_article_has_category(self):
        """Vérifie le lien entre Article et Catégorie"""
        self.assertEqual(self.article.category.name, "Méditation")
