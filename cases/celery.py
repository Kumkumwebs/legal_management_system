from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
   'send-hearing-reminders': {
        'task': 'cases.tasks.send_hearing_reminders',
        'schedule': crontab(hour=8, minute=0),  # runs at 8am daily
    },
  }
 