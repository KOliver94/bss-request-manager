from celery import shared_task
from django.core.management import call_command


@shared_task
def scheduled_sync_ldap_users():
    call_command("sync_ldap")


@shared_task
def scheduled_update_request_status():
    call_command("update_request_status")


@shared_task
def scheduled_send_daily_reminder_email():
    call_command("email_daily_reminders")


@shared_task
def scheduled_send_weekly_tasks_email():
    call_command("email_weekly_tasks")


@shared_task
def scheduled_send_unfinished_requests_email():
    call_command("email_unfinished_requests")


@shared_task
def scheduled_flush_expired_jwt_tokens():
    call_command("flushexpiredtokens")
