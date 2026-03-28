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
    list_display = ("title", "category", "author", "published")
    list_filter = ("category", "published", "author")
    search_fields = ("title", "content")
    date_hierarchy = "published"


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "article")
    list_filter = ("user", "article")
    search_fields = (
        "user__email",
        "article__title",
    )
