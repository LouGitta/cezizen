from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets, generics

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


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer


class BreathingExerciceViewSet(viewsets.ModelViewSet):
    queryset = BreathingExercice.objects.all()
    serializer_class = BreathingExerciceSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return permission_classes


class FavoriteViewSet(viewsets.ModelViewSet):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
