from rest_framework import status
from .base import BaseAPITestCase
from ..models import Category, Article


class CategoryTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()

    def test_list_categories(self):
        """Vérifie la liste des catégories (Read)"""
        self.client.force_authenticate(user=self.admin)
        url = "/api/v1/category/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_category_admin_allowed(self):
        """Vérifie la création d'une catégorie par un administrateur (Create)"""
        self.client.force_authenticate(user=self.admin)
        url = "/api/v1/category/"
        payload = {"name": "Psychologie"}
        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.count(), 2)

    def test_create_category_user_forbidden(self):
        """Vérifie qu'un utilisateur standard NE PEUT PAS créer de catégorie"""
        self.client.force_authenticate(user=self.user)
        url = "/api/v1/category/"
        payload = {"name": "Hack Catégorie"}

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Category.objects.count(), 1)

    def test_cascade_delete_category(self):
        """Si on supprime une catégorie, les articles liés doivent disparaître de la base"""
        self.assertEqual(Article.objects.count(), 1)
        self.category.delete()
        self.assertEqual(Article.objects.count(), 0)
        self.assertEqual(Category.objects.count(), 0)
