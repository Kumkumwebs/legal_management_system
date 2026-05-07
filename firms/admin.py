from django.contrib import admin
from .models import Firm
from accounts.models import UserProfile


@admin.register(Firm)
class FirmAdmin(admin.ModelAdmin):

    # 🔹 LIST VIEW
    list_display = (
        'id',
        'name',
        'email',
        'phone',
        'is_active',
        'is_verified',
        'is_blocked',
        'total_users',
        'created_at'
    )

    search_fields = (
        'name',
        'email',
        'gst_number',
        'pan_number'
    )

    list_filter = (
        'is_active',
        'is_verified',
        'is_blocked',
        'state',
        'created_at'
    )

    readonly_fields = (
        'created_at',
        'updated_at',
        'total_users'
    )

    ordering = ('-created_at',)

    # 🔹 FIELD GROUPING
    fieldsets = (
        ("🏢 Basic Info", {
            'fields': (
                'name', 'email', 'phone',
                'address', 'city', 'state', 'pincode'
            )
        }),

        ("📄 Legal Details", {
            'fields': (
                'gst_number',
                'pan_number',
                'agreement_file',
            )
        }),

        ("📊 Status", {
            'fields': (
                'is_active',
                'is_verified',
                'is_blocked'
            )
        }),

        ("📈 Metrics", {
            'fields': (
                'total_users',
            )
        }),

        ("⏱️ Timestamps", {
            'fields': (
                'created_at',
                'updated_at'
            )
        }),
    )

    # 🔥 CUSTOM COLUMN (User count)
    def total_users(self, obj):
        return UserProfile.objects.filter(firm=obj).count()

    total_users.short_description = "Users"

    # 🔥 ACTIONS (VERY IMPORTANT)
    actions = ['activate_firms', 'block_firms', 'verify_firms']

    def activate_firms(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, "Selected firms activated")

    def block_firms(self, request, queryset):
        queryset.update(is_blocked=True)
        self.message_user(request, "Selected firms blocked")

    def verify_firms(self, request, queryset):
        queryset.update(is_verified=True)
        self.message_user(request, "Selected firms verified")

    activate_firms.short_description = "Activate selected firms"
    block_firms.short_description = "Block selected firms"
    verify_firms.short_description = "Verify selected firms"