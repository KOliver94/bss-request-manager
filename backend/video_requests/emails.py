from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from common.utilities import (
    get_editor_in_chief,
    get_pr_responsible,
    get_production_manager,
)

TEXT_HTML = "text/html"
BASE_URL = settings.BASE_URL


# EmailMultiAlternatives object attributes detailed description
# https://docs.djangoproject.com/en/3.0/topics/email/#emailmessage-objects
def debug_email(subject, msg_plain):
    return EmailMultiAlternatives(
        subject=subject, body=msg_plain, to=[settings.DEBUG_EMAIL],
    )


def email_user_new_request_confirmation(request):
    context = {
        "base_url": BASE_URL,
        "first_name": request.requester.first_name,
        "request": request,
        "is_registered": request.requester.is_active,
        "details_url": f"{BASE_URL}/my-requests/{request.id}",
    }

    msg_plain = render_to_string("email/txt/user_new_request_confirmation.txt", context)
    msg_html = render_to_string(
        "email/html/user_new_request_confirmation.html", context
    )

    subject = f"{request.title} | Forgatási felkérésedet fogadtuk"
    editor_in_chief_email_address = (
        [user.email for user in get_editor_in_chief()]
        if get_editor_in_chief().exists()
        else ""
    )

    msg = (
        EmailMultiAlternatives(
            subject=subject,
            body=msg_plain,
            to=[request.requester.email],
            cc=[settings.DEFAULT_REPLY_EMAIL],
            bcc=[editor_in_chief_email_address],
            reply_to=[settings.DEFAULT_REPLY_EMAIL],
        )
        if not settings.DEBUG_EMAIL
        else debug_email(subject, msg_plain)
    )

    msg.attach_alternative(msg_html, TEXT_HTML)
    msg.send()


def email_user_video_published(video):
    context = {
        "base_url": BASE_URL,
        "first_name": video.request.requester.first_name,
        "is_registered": video.request.requester.is_active,
        "video_title": video.title,
        "video_url": video.additional_data["publishing"]["website"],
        "rating_url": f"{BASE_URL}/my-requests/{video.request.id}",
    }

    msg_plain = render_to_string("email/txt/user_video_published.txt", context)
    msg_html = render_to_string("email/html/user_video_published.html", context)

    subject = f"{video.request.title} | Új videót publikáltunk"
    pr_responsible_email_address = (
        [user.email for user in get_pr_responsible()]
        if get_pr_responsible().exists()
        else ""
    )

    msg = (
        EmailMultiAlternatives(
            subject=subject,
            body=msg_plain,
            to=[video.request.requester.email],
            bcc=[pr_responsible_email_address],
            reply_to=[settings.DEFAULT_REPLY_EMAIL],
        )
        if not settings.DEBUG_EMAIL
        else debug_email(subject, msg_plain)
    )

    msg.attach_alternative(msg_html, TEXT_HTML)
    msg.send()


def email_user_new_comment(comment):
    context = {
        "base_url": BASE_URL,
        "first_name": comment.request.requester.first_name,
        "request_title": comment.request.title,
        "commenter_avatar": comment.author.userprofile.avatar_url
        if comment.author.userprofile.avatar_url
        else BASE_URL + "/static/images/default_avatar.png",
        "commenter_name": f"{comment.author.last_name} {comment.author.first_name}",
        "comment_message": comment.text,
        "comment_created": comment.created,
        "comment_url": f"{BASE_URL}/my-requests/{comment.request.id}",
    }

    msg_plain = render_to_string("email/txt/user_new_comment.txt", context)
    msg_html = render_to_string("email/html/user_new_comment.html", context)

    subject = f"{comment.request.title} | Hozzászólás érkezett"

    msg = (
        EmailMultiAlternatives(
            subject=subject,
            body=msg_plain,
            to=[comment.request.requester.email],
            reply_to=[settings.DEFAULT_REPLY_EMAIL],
        )
        if not settings.DEBUG_EMAIL
        else debug_email(subject, msg_plain)
    )

    msg.attach_alternative(msg_html, TEXT_HTML)
    msg.send()


def email_staff_weekly_tasks(recording, editing):
    context = {"base_url": BASE_URL, "recording": recording, "editing": editing}

    msg_plain = render_to_string("email/txt/staff_weekly_tasks.txt", context)
    msg_html = render_to_string("email/html/staff_weekly_tasks.html", context)

    subject = "Eheti forgatások és vágandó anyagok"

    msg = (
        EmailMultiAlternatives(
            subject=subject,
            body=msg_plain,
            to=[settings.WEEKLY_TASK_EMAIL],
            reply_to=[settings.WEEKLY_TASK_EMAIL],
        )
        if not settings.DEBUG_EMAIL
        else debug_email(subject, msg_plain)
    )

    msg.attach_alternative(msg_html, TEXT_HTML)
    msg.send()


def email_crew_daily_reminder(request, crew_members):
    context = {
        "base_url": BASE_URL,
        "request_title": request.title,
        "request_url": f"{BASE_URL}/admin/requests/{request.id}",
    }
    msg_plain = render_to_string("email/txt/crew_daily_reminder.txt", context)
    msg_html = render_to_string("email/html/crew_daily_reminder.html", context)

    subject = f"Emlékeztető | {request.title} | Mai forgatás"

    msg = (
        EmailMultiAlternatives(
            subject=subject,
            body=msg_plain,
            to=[user.member.email for user in crew_members],
        )
        if not settings.DEBUG_EMAIL
        else debug_email(subject, msg_plain)
    )

    msg.attach_alternative(msg_html, TEXT_HTML)
    msg.send()


def email_crew_new_comment(comment):
    context = {
        "base_url": BASE_URL,
        "request_title": comment.request.title,
        "comment_internal": comment.internal,
        "commenter_avatar": comment.author.userprofile.avatar_url
        if comment.author.userprofile.avatar_url
        else BASE_URL + "/static/images/default_avatar.png",
        "commenter_name": f"{comment.author.last_name} {comment.author.first_name}",
        "comment_message": comment.text,
        "comment_created": comment.created,
        "comment_url": f"{BASE_URL}/admin/requests/{comment.request.id}",
    }

    msg_plain = render_to_string("email/txt/crew_new_comment.txt", context)
    msg_html = render_to_string("email/html/crew_new_comment.html", context)

    subject = f"{comment.request.title} | Hozzászólás érkezett"
    editor_in_chief_email_address = (
        [user.email for user in get_editor_in_chief()]
        if get_editor_in_chief().exists()
        else ""
    )
    responsible_email_address = (
        comment.request.responsible.email if comment.request.responsible else ""
    )
    crew_members_email_addresses = (
        [user.member.email for user in comment.request.crew.all()]
        if comment.request.crew.exists()
        else ""
    )

    msg = (
        EmailMultiAlternatives(
            subject=subject,
            body=msg_plain,
            to=[crew_members_email_addresses],
            cc=[editor_in_chief_email_address, responsible_email_address],
        )
        if not settings.DEBUG_EMAIL
        else debug_email(subject, msg_plain)
    )

    msg.attach_alternative(msg_html, TEXT_HTML)
    msg.send()


def email_production_manager_unfinished_requests(requests):
    context = {"base_url": BASE_URL, "requests": requests}

    msg_plain = render_to_string(
        "email/txt/production_manager_unfinished_requests.txt", context
    )
    msg_html = render_to_string(
        "email/html/production_manager_unfinished_requests.html", context
    )

    subject = "Lezáratlan anyagok"
    production_manager_email_address = (
        [user.email for user in get_production_manager()]
        if get_production_manager().exists()
        else ""
    )

    msg = (
        EmailMultiAlternatives(
            subject=subject, body=msg_plain, to=[production_manager_email_address],
        )
        if not settings.DEBUG_EMAIL
        else debug_email(subject, msg_plain)
    )

    msg.attach_alternative(msg_html, TEXT_HTML)
    msg.send()
