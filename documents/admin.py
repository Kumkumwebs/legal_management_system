from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'case', 'firm', 'uploaded_by', 'created_at')
    search_fields = ('case__title',)