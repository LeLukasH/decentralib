from django.db import models

# Create your models here.
from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    isbn = models.CharField(max_length=13, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    language = models.CharField(max_length=50, default='English')
    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['title', 'author']

    def __str__(self):
        return self.title