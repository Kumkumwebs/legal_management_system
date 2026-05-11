from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        # ✅ Exact name of your last migration
        ('firms', '0002_alter_firm_options_remove_firm_agreement_signed_at_and_more'),
    ]

    operations = [
        # Branding
        migrations.AddField(
            model_name='firm', name='logo',
            field=models.ImageField(upload_to='firm_logos/', null=True, blank=True),
        ),
        migrations.AddField(
            model_name='firm', name='theme_color',
            field=models.CharField(max_length=20, default='#0D1B2A'),
        ),
        migrations.AddField(
            model_name='firm', name='accent_color',
            field=models.CharField(max_length=20, default='#C9A84C'),
        ),
        migrations.AddField(
            model_name='firm', name='font_family',
            field=models.CharField(max_length=100, default='DM Sans, sans-serif'),
        ),
        migrations.AddField(
            model_name='firm', name='sidebar_dark',
            field=models.BooleanField(default=True),
        ),
        # Website
        migrations.AddField(
            model_name='firm', name='tagline',
            field=models.CharField(max_length=200, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='firm', name='about_text',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='firm', name='practice_areas',
            field=models.JSONField(default=list, blank=True),
        ),
        migrations.AddField(
            model_name='firm', name='website_phone',
            field=models.CharField(max_length=20, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='firm', name='website_email',
            field=models.EmailField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='firm', name='whatsapp_number',
            field=models.CharField(max_length=20, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='firm', name='bar_registration',
            field=models.CharField(max_length=100, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='firm', name='gstin',
            field=models.CharField(max_length=20, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='firm', name='hero_image',
            field=models.ImageField(upload_to='firm_hero/', null=True, blank=True),
        ),
        migrations.AddField(
            model_name='firm', name='website_template',
            field=models.CharField(max_length=30, default='classic', blank=True),
        ),
        migrations.AddField(
            model_name='firm', name='website_enabled',
            field=models.BooleanField(default=False),
        ),
    ]