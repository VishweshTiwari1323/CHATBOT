from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [

    path("", views.home, name="home"),

    path("login/", views.login_view, name="login"),

    path("register/", views.register, name="register"),

    path("dashboard/", views.dashboard, name="dashboard"),

    path("chatbot/", views.chatbot, name="chatbot"),

    

    path("profile/", views.profile, name="profile"),

    path("edit-profile/", views.edit_profile, name="edit_profile"),

    path("history/", views.history, name="history"),

    path("history/delete/<int:chat_id>/", views.delete_chat, name="delete_chat"),

    path("history/save/<int:chat_id>/", views.toggle_save_chat, name="toggle_save_chat"),

    path("change-password/", views.change_password, name="change_password"),

    path("logout/", views.logout_view, name="logout"),
    path('images/', views.images_view, name='images'),
    path('videos/', views.videos_view, name='videos'),
    path('google-bypass/', views.google_bypass, name='google_bypass'),
    path('api/chat/', views.chat_api_view, name='chat_api'),
   
    path("chatbot/send/", views.chat_api_view, name="send_message"),
    path('login/', views.login_view, name='login'),
    path('register/', views.register, name='register'), # <-- Ensure name='register' matches
    path('google-bypass/', views.google_bypass, name='google_bypass'),


]
# Add this to the bottom of your main project urls.py
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)