from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone', 'firm', 'created_at')
    search_fields = ('name', 'phone')
    list_filter = ('firm',)