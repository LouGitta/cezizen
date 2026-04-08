from django.contrib import admin
from .models import BreathingExercice, Category, Article, Favorite


@admin.register(BreathingExercice)
class BreathingExerciceAdmin(admin.ModelAdmin):
    list_display = ("name", "inhale", "hold", "exhale", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)
    list_editable = ("is_active",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "published")
    list_filter = ("category",)
    search_fields = ("title",)

    fieldsets = (
        (
            "Informations Générales",
            {
                "fields": ("title", "category", "image"),
                "description": "Les informations principales qui apparaîtront sur la carte de l'article.",
            },
        ),
        (
            "Rédaction",
            {
                "fields": ("content",),
                "classes": ("wide",),  # Utilise toute la largeur de l'écran
            },
        ),
    )

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "article")
    list_filter = ("user", "article")
    search_fields = (
        "user__email",
        "article__title",
    )
