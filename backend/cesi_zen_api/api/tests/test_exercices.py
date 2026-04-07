from rest_framework import status
from .base import BaseAPITestCase
from ..models import BreathingExercice


class BreathingExerciceTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()

        self.exercice = BreathingExercice.objects.create(
            name="Respiration Carrée", inhale=4000, hold=4000, exhale=4000
        )

    def test_exercice_read_public(self):
        """Un visiteur anonyme peut voir la liste des exercices"""
        self.client.logout()
        response = self.client.get("/api/v1/breathing_excercices/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_exercice_create_admin_allowed(self):
        """Un administrateur PEUT créer un exercice"""
        self.client.force_authenticate(user=self.admin)
        payload = {
            "name": "Cohérence Rapide",
            "inhale": 5000,
            "hold": 0,
            "exhale": 5000,
        }
        response = self.client.post(
            "/api/v1/breathing_excercices/", payload, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BreathingExercice.objects.count(), 2)

    def test_exercice_create_user_forbidden(self):
        """Un utilisateur standard NE PEUT PAS créer d'exercice"""
        self.client.force_authenticate(user=self.user)
        payload = {"name": "Hack Exercice", "inhale": 1000, "hold": 0, "exhale": 1000}
        response = self.client.post(
            "/api/v1/breathing_excercices/", payload, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(BreathingExercice.objects.count(), 1)

    def test_update_breathing_exercice_admin_allowed(self):
        """Vérifie la modification d'un exercice par un admin (Update)"""
        self.client.force_authenticate(user=self.admin)
        url = f"/api/v1/breathing_excercices/{self.exercice.id}/"
        payload = {"name": "Carrée Modifiée"}
        response = self.client.patch(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.exercice.refresh_from_db()
        self.assertEqual(self.exercice.name, "Carrée Modifiée")

    def test_exercice_delete_admin_allowed(self):
        """Un administrateur PEUT supprimer un exercice"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(
            f"/api/v1/breathing_excercices/{self.exercice.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(BreathingExercice.objects.count(), 0)
