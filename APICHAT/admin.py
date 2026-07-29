from django.contrib import admin
from .models import Profile, ChatMessage


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "bio")
    search_fields = ("user__username",)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("user", "message", "is_saved", "created_at")
    list_filter = ("is_saved", "created_at")
    search_fields = ("user__username", "message")
