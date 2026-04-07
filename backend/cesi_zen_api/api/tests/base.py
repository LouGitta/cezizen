from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from ..models import Article, Category


class BaseAPITestCase(APITestCase):
    """
    Classe de base pour tous les tests de l'API CESIZen.
    Elle pré-configure les utilisateurs standards et admins.
    """

    def setUp(self):
        # Configuration globale pour tous les futurs tests
        self.user = User.objects.create_user(
            username="zen_user", password="password123"
        )
        self.admin = User.objects.create_user(
            username="zen_admin", password="password123", is_staff=True
        )

        self.category = Category.objects.create(name="Méditation")

        self.article = Article.objects.create(
            title="Le pouvoir du moment présent",
            content="Ceci est un test de contenu...",
            category=self.category,
            author=self.admin,
        )
