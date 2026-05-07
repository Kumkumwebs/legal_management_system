from django.contrib import admin
from .models import Hearing


@admin.register(Hearing)
class HearingAdmin(admin.ModelAdmin):
    list_display = ('id', 'case', 'date', 'start_time', 'court_name')
    search_fields = ('case__title', 'court_name')
    list_filter = ('date',)