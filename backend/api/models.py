from django.db import models

# Create your models here.

class SignupLog(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} <{self.email}>"


class ChatHistory(models.Model):
    session_id = models.CharField(max_length=128)
    messages = models.JSONField(default=list)  # List of {role, content}
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"ChatHistory {self.session_id} ({self.created_at})"
