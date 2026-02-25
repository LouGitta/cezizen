from django.db import models
from django.conf import settings


# Create your models here.
class BreathingExercice(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    inhale = models.IntegerField
    exhale = models.IntegerField
    hold = models.IntegerField
    loop = models.IntegerField
    description = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)


class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)


class Article(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=50)
    content = models.TextField()
    user = models.CharField(max_length=50)
    user = models.CharField(max_length=50)
    article = models.IntegerField
    exhale = models.IntegerField
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    published = models.DateTimeField()


class Favorite(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.CharField(max_length=50)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    exhale = models.IntegerField
    hold = models.IntegerField
    loop = models.IntegerField
