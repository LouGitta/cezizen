from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
import os
import prometheus_client
from django.http import HttpResponse
from prometheus_client import multiprocess, Gauge

from .serializer import (
    GroupSerializer,
    UserSerializer,
    ArticleSerializer,
    BreathingExerciceSerializer,
    FavoriteSerializer,
    CategorySerializer,
    RegisterSerializer,
)

from .models import (
    Article,
    BreathingExercice,
    Favorite,
    Category,
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["delete"], url_path="me")
    def delete_me(self, request):
        user = request.user

        if user and user.is_authenticated:
            user.delete()
            return Response(
                {"message": "Votre compte a été supprimé avec succès."},
                status=status.HTTP_204_NO_CONTENT,
            )

        return Response(
            {"error": "Impossible de supprimer ce compte."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    @action(
        detail=False,
        methods=["patch"],
        url_path="update_me",
        permission_classes=[permissions.IsAuthenticated],
    )
    def update_me(self, request):
        user = request.user
        data = request.data
        has_changed = False

        if "username" in data and data["username"] != "":
            # Vérifier si le pseudo n'est pas déjà pris par quelqu'un d'autre
            if (
                User.objects.filter(username=data["username"])
                .exclude(id=user.id)
                .exists()
            ):
                return Response(
                    {"error": "Ce nom d'utilisateur est déjà pris."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.username = data["username"]
            has_changed = True

        if "new_password" in data and data["new_password"] != "":
            if "current_password" not in data or not user.check_password(
                data["current_password"]
            ):
                return Response(
                    {"error": "L'ancien mot de passe est incorrect."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.set_password(data["new_password"])
            has_changed = True

        if has_changed:
            user.save()
            return Response(
                {"message": "Profil mis à jour avec succès."}, status=status.HTTP_200_OK
            )

        return Response(
            {"message": "Aucune modification apportée."}, status=status.HTTP_200_OK
        )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer


class BreathingExerciceViewSet(viewsets.ModelViewSet):
    queryset = BreathingExercice.objects.all()
    serializer_class = BreathingExerciceSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return super().get_permissions()


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return super().get_permissions()


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def favorite(self, request, pk=None):
        article = self.get_object()
        user = request.user

        favorite, created = Favorite.objects.get_or_create(user=user, article=article)

        if not created:
            favorite.delete()
            return Response({"status": "removed", "is_favorite": False})

        return Response({"status": "added", "is_favorite": True})


class FavoriteViewSet(viewsets.ModelViewSet):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --- Custom Prometheus Database Gauges ---
USER_COUNT = Gauge('django_db_users_total', 'Total number of users in the database')
ARTICLE_COUNT = Gauge('django_db_articles_total', 'Total number of articles in the database')
EXERCISE_COUNT = Gauge('django_db_exercises_total', 'Total number of breathing exercises in the database')
FAVORITE_COUNT = Gauge('django_db_favorites_total', 'Total number of favorites in the database')

def custom_metrics_view(request):
    # Update gauge values with live database counts
    USER_COUNT.set(User.objects.count())
    ARTICLE_COUNT.set(Article.objects.count())
    EXERCISE_COUNT.set(BreathingExercice.objects.count())
    FAVORITE_COUNT.set(Favorite.objects.count())
    
    # Process multiprocess aggregation if configured
    if "PROMETHEUS_MULTIPROC_DIR" in os.environ or "prometheus_multiproc_dir" in os.environ:
        registry = prometheus_client.CollectorRegistry()
        multiprocess.MultiProcessCollector(registry)
    else:
        registry = prometheus_client.REGISTRY
        
    metrics_page = prometheus_client.generate_latest(registry)
    return HttpResponse(metrics_page, content_type=prometheus_client.CONTENT_TYPE_LATEST)
