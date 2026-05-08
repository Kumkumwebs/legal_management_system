"""
firms/migrations/0003_firm_website_fields.py

Run: python manage.py migrate
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('firms', '0002_alter_firm_options_remove_firm_agreement_signed_at_and_more'),   # ← change to your actual last migration name
    ]

    operations = [
        # ── Whitelabel / branding ──────────────────────────────
        migrations.AddField(
            model_name='firm',
            name='logo',
            field=models.ImageField(
                upload_to='firm_logos/',
                null=True, blank=True,
                help_text='Firm logo displayed on website and dashboard'
            ),
        ),
        migrations.AddField(
            model_name='firm',
            name='theme_color',
            field=models.CharField(
                max_length=20, default='#0D1B2A',
                help_text='Primary brand color (hex)'
            ),
        ),
        migrations.AddField(
            model_name='firm',
            name='accent_color',
            field=models.CharField(
                max_length=20, default='#C9A84C',
                help_text='Accent / button color (hex)'
            ),
        ),
        migrations.AddField(
            model_name='firm',
            name='font_family',
            field=models.CharField(
                max_length=100, default='Inter',
                help_text='Font family name'
            ),
        ),
        migrations.AddField(
            model_name='firm',
            name='sidebar_dark',
            field=models.BooleanField(
                default=True,
                help_text='Use dark sidebar in dashboard'
            ),
        ),

        # ── Website template ───────────────────────────────────
        migrations.AddField(
            model_name='firm',
            name='website_template',
            field=models.CharField(
                max_length=30,
                choices=[
                    ('classic',   'Classic — Dark & Prestigious'),
                    ('modern',    'Modern — Light & Minimal'),
                    ('bold',      'Bold — High Contrast Editorial'),
                    ('elegant',   'Elegant — Cream & Gold Art Deco'),
                ],
                default='classic',
                help_text='Website template shown to public clients'
            ),
        ),
        migrations.AddField(
            model_name='firm',
            name='website_enabled',
            field=models.BooleanField(
                default=False,
                help_text='Make public website live'
            ),
        ),

        # ── Website content fields ─────────────────────────────
        migrations.AddField(
            model_name='firm',
            name='tagline',
            field=models.CharField(
                max_length=200, blank=True, default='',
                help_text='Hero tagline shown on website'
            ),
        ),
        migrations.AddField(
            model_name='firm',
            name='about_text',
            field=models.TextField(
                blank=True, default='',
                help_text='About section text'
            ),
        ),
        migrations.AddField(
            model_name='firm',
            name='practice_areas',
            field=models.JSONField(
                default=list, blank=True,
                help_text='List of practice areas e.g. ["Criminal", "Civil", "Family"]'
            ),
        ),
        migrations.AddField(
            model_name='firm',
            name='website_phone',
            field=models.CharField(max_length=20, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='firm',
            name='website_email',
            field=models.EmailField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='firm',
            name='whatsapp_number',
            field=models.CharField(max_length=20, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='firm',
            name='bar_registration',
            field=models.CharField(max_length=100, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='firm',
            name='gstin',
            field=models.CharField(max_length=20, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='firm',
            name='hero_image',
            field=models.ImageField(
                upload_to='firm_hero/',
                null=True, blank=True,
            ),
        ),
    ]