from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Article, Category, BreathingExercice, Favorite


class CesizenFullAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="zen_user", password="password123"
        )
        self.category = Category.objects.create(name="Méditation")

        self.article = Article.objects.create(
            title="Le pouvoir du moment présent",
            content="Ceci est un test de contenu...",
            category=self.category,
            author=self.user,
        )

        self.exercice = BreathingExercice.objects.create(
            name="Respiration Carrée", inhale=4000, hold=4000, exhale=4000
        )

    # --- TESTS AUTHENTIFICATION (JWT) ---
    def test_user_register(self):
        """Vérifie la création d'un utilisateur"""
        response = self.client.post(
            "/api/auth/register/",
            {"username": "zen_user_bis", "password": "password123"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("username", response.data)

    def test_jwt_login(self):
        """Vérifie que l'obtention du token fonctionne"""
        response = self.client.post(
            "/api/auth/login/", {"username": "zen_user", "password": "password123"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    # --- TESTS ARTICLES & CATEGORIES ---
    def test_list_articles(self):
        """Vérifie que n'importe qui peut voir les articles"""
        response = self.client.get("/api/v1/articles/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_article_has_category(self):
        """Vérifie le lien entre Article et Catégorie"""
        self.assertEqual(self.article.category.name, "Méditation")

    # --- TESTS EXERCICES ---
    def test_list_breathing_exercices(self):
        """Vérifie la récupération des exercices de respiration"""
        response = self.client.get("/api/v1/breathing_excercices/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["name"], "Respiration Carrée")

    # --- TESTS FAVORIS (Le coeur de ton app) ---
    def test_add_favorite_authenticated(self):
        """Vérifie qu'un utilisateur connecté peut mettre en favori"""
        self.client.force_authenticate(user=self.user)
        # On simule l'appel à ton endpoint de favori
        url = f"/api/v1/articles/{self.article.id}/favorite/"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Vérification en base de données
        self.assertTrue(
            Favorite.objects.filter(user=self.user, article=self.article).exists()
        )

    def test_duplicate_favorite_prevented(self):
        """Vérifie que l'unique_together empêche les doublons de favoris"""
        Favorite.objects.create(user=self.user, article=self.article)
        with self.assertRaises(Exception):  # Django lèvera une IntegrityError
            Favorite.objects.create(user=self.user, article=self.article)

    def test_favorite_unauthorized(self):
        """Vérifie qu'un utilisateur anonyme ne peut pas mettre en favori"""
        url = f"/api/v1/articles/{self.article.id}/favorite/"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- TESTS DE SUPPRESSION (CASCADE) ---
    def test_cascade_delete_category(self):
        """Si on supprime une catégorie, les articles liés doivent disparaître"""
        self.category.delete()
        self.assertEqual(Article.objects.count(), 0)
