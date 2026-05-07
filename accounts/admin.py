from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'firm', 'role', 'created_at')
    search_fields = ('user__username', 'firm__name')
    list_filter = ('role',)
    readonly_fields = ('created_at', 'updated_at')