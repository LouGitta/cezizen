from rest_framework import status
from django.db import IntegrityError
from .base import BaseAPITestCase
from ..models import Favorite


class FavoriteTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()

    def test_add_favorite_authenticated(self):
        """Vérifie qu'un utilisateur connecté peut mettre un article en favori"""
        self.client.force_authenticate(user=self.user)

        url = f"/api/v1/articles/{self.article.id}/favorite/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "added")  # Vérifie la réponse JSON
        self.assertTrue(
            Favorite.objects.filter(user=self.user, article=self.article).exists()
        )

    def test_duplicate_favorite_prevented(self):
        """Vérifie que la contrainte unique_together empêche les doublons en BDD"""
        Favorite.objects.create(user=self.user, article=self.article)

        with self.assertRaises(IntegrityError):
            Favorite.objects.create(user=self.user, article=self.article)

    def test_remove_favorite_authenticated(self):
        """Vérifie qu'un utilisateur peut retirer un favori (Système de Toggle)"""
        Favorite.objects.create(user=self.user, article=self.article)
        self.client.force_authenticate(user=self.user)

        url = f"/api/v1/articles/{self.article.id}/favorite/"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "removed")
        self.assertFalse(
            Favorite.objects.filter(user=self.user, article=self.article).exists()
        )

    def test_favorite_unauthorized(self):
        """Vérifie qu'un utilisateur anonyme est bloqué (Erreur 401)"""
        self.client.logout()

        url = f"/api/v1/articles/{self.article.id}/favorite/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(Favorite.objects.filter(article=self.article).exists())
