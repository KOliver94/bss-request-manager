from io import StringIO

from celery import shared_task
from django.core.management import call_command


@shared_task
def scheduled_sync_ldap_users():
    with StringIO() as out:
        call_command("sync_ldap", stdout=out)
        return out.getvalue()


@shared_task
def scheduled_update_request_status():
    with StringIO() as out:
        call_command("update_request_status", stdout=out)
        return out.getvalue()


@shared_task
def scheduled_send_daily_reminder_email():
    with StringIO() as out:
        call_command("email_daily_reminders", stdout=out)
        return out.getvalue()


@shared_task
def scheduled_send_weekly_tasks_email():
    with StringIO() as out:
        call_command("email_weekly_tasks", stdout=out)
        return out.getvalue()


@shared_task
def scheduled_send_unfinished_requests_email():
    with StringIO() as out:
        call_command("email_unfinished_requests", stdout=out)
        return out.getvalue()


@shared_task
def scheduled_send_overdue_requests_email():
    with StringIO() as out:
        call_command("email_overdue_requests", stdout=out)
        return out.getvalue()


@shared_task
def scheduled_flush_expired_jwt_tokens():
    with StringIO() as out:
        call_command("flushexpiredtokens", stdout=out)
        return out.getvalue()
