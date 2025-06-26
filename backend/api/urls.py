from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('code-review/', views.code_review, name='code_review'),
    path('signup/', views.signup, name='signup'),
    path('fetch-user-chats/', views.fetch_user_chats, name='fetch_user_chats'),
]