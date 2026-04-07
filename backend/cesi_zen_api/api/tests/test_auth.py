from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User


class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="zen_user", password="password123"
        )

    def test_user_register(self):
        """Vérifie la création d'un utilisateur"""
        response = self.client.post(
            "/api/auth/register/",
            {"username": "zen_user_bis", "password": "password123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_jwt_login(self):
        """Vérifie que l'obtention du token fonctionne"""
        response = self.client.post(
            "/api/auth/login/",
            {"username": "zen_user", "password": "password123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
