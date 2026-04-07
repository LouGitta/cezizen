from django.db import models
from django.conf import settings
from django.utils import timezone
from ckeditor.fields import RichTextField


class BreathingExercice(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    inhale = models.IntegerField()
    exhale = models.IntegerField()
    hold = models.IntegerField()
    description = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Article(models.Model):
    id = models.AutoField(primary_key=True)
    image = models.URLField(blank=True, null=True)
    title = models.CharField(max_length=100)
    content = RichTextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    published = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


class Favorite(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    article = models.ForeignKey(Article, on_delete=models.CASCADE)

    class Meta:
        unique_together = ["user", "article"]
