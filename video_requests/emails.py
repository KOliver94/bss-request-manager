from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from common.utilities import get_editor_in_chief, get_pr_responsible, get_production_manager
from manager import settings

TEXT_HTML = 'text/html'


# EmailMultiAlternatives object attributes detailed description
# https://docs.djangoproject.com/en/3.0/topics/email/#emailmessage-objects
def email_user_new_request_confirmation(request):
    context = {
        'first_name': request.requester.first_name,
        'request': request,
        'registered': request.requester.is_active,
        'details_url': f'https://{settings.BASE_URL}/requests/{request.id}'
    }

    msg_plain = render_to_string('email/txt/user_new_request_confirmation.txt', context)
    msg_html = render_to_string('email/html/user_new_request_confirmation.html', context)

    editor_in_chief_email_address = \
        [user.email for user in get_editor_in_chief()] if get_editor_in_chief().exists() else ''

    msg = EmailMultiAlternatives(
        subject=f'{request.title} | Forgatási felkérésedet fogadtuk',
        body=msg_plain,
        to=[request.requester.email],
        cc=[settings.DEFAULT_REPLY_EMAIL],
        bcc=[editor_in_chief_email_address],
        reply_to=[settings.DEFAULT_REPLY_EMAIL],
    )
    msg.attach_alternative(msg_html, TEXT_HTML)

    msg.send()


def email_user_video_published(video):
    context = {
        'first_name': video.request.requester.first_name,
        'registered': video.request.requester.is_active,
        'video_title': video.title,
        'video_url': video.additional_data['publishing']['website'],
        'rating_url': f'https://{settings.BASE_URL}/requests/{video.request.id}/videos/{video.id}/rating'
    }

    msg_plain = render_to_string('email/txt/user_video_published.txt', context)
    msg_html = render_to_string('email/html/user_video_published.html', context)

    pr_responsible_email_address = \
        [user.email for user in get_pr_responsible()] if get_pr_responsible().exists() else ''

    msg = EmailMultiAlternatives(
        subject=f'{video.request.title} | Új videót publikáltunk',
        body=msg_plain,
        to=[video.request.requester.email],
        bcc=[pr_responsible_email_address],
        reply_to=[settings.DEFAULT_REPLY_EMAIL],
    )
    msg.attach_alternative(msg_html, TEXT_HTML)
    msg.send()


def email_user_new_comment(comment):
    context = {
        'first_name': comment.request.requester.first_name,
        'request_title': comment.request.title,
        'commenter_name': f'{comment.author.last_name} {comment.author.first_name}',
        'comment_message': comment.text,
        'comment_created': comment.created,
        'comment_url': f'https://{settings.BASE_URL}/requests/{comment.request.id}/comments'
    }

    msg_plain = render_to_string('email/txt/user_new_comment.txt', context)
    msg_html = render_to_string('email/html/user_new_comment.html', context)

    msg = EmailMultiAlternatives(
        subject=f'{comment.request.title} | Hozzászólás érkezett',
        body=msg_plain,
        to=[comment.request.requester.email],
        reply_to=[settings.DEFAULT_REPLY_EMAIL],
    )
    msg.attach_alternative(msg_html, TEXT_HTML)
    msg.send()


def email_staff_weekly_tasks(recording, editing):
    context = {
        'recording': recording,
        'editing': editing
    }

    msg_plain = render_to_string('email/txt/staff_weekly_tasks.txt', context)
    msg_html = render_to_string('email/html/staff_weekly_tasks.html', context)

    msg = EmailMultiAlternatives(
        subject='Eheti forgatások és vágandó anyagok',
        body=msg_plain,
        to=[settings.WEEKLY_TASK_EMAIL],
        reply_to=[settings.WEEKLY_TASK_EMAIL],
    )
    msg.attach_alternative(msg_html, TEXT_HTML)
    msg.send()


def email_crew_daily_reminder(request, crew_members):
    context = {
        'request_title': request.title,
        'request_url': f'https://{settings.BASE_URL}/admin/requests/{request.id}'
    }
    msg_plain = render_to_string('email/txt/crew_daily_reminder.txt', context)
    msg_html = render_to_string('email/html/crew_daily_reminder.html', context)

    msg = EmailMultiAlternatives(
        subject=f'Emlékeztető | {request.title} | Mai forgatás',
        body=msg_plain,
        to=[user.member.email for user in crew_members],
    )
    msg.attach_alternative(msg_html, TEXT_HTML)
    msg.send()


def email_crew_new_comment(comment):
    context = {
        'request_title': comment.request.title,
        'comment_internal': comment.internal,
        'commenter_name': f'{comment.author.last_name} {comment.author.first_name}',
        'comment_message': comment.text,
        'comment_created': comment.created,
        'comment_url': f'https://{settings.BASE_URL}/requests/{comment.request.id}/comments'
    }

    msg_plain = render_to_string('email/txt/crew_new_comment.txt', context)
    msg_html = render_to_string('email/html/crew_new_comment.html', context)

    editor_in_chief_email_address = \
        [user.email for user in get_editor_in_chief()] if get_editor_in_chief().exists() else ''
    responsible_email_address = comment.request.responsible.email if comment.request.responsible else ''
    crew_members_email_addresses = \
        [user.member.email for user in comment.request.crew.all()] if comment.request.crew.exists() else ''

    msg = EmailMultiAlternatives(
        subject=f'{comment.request.title} | Hozzászólás érkezett',
        body=msg_plain,
        to=[crew_members_email_addresses],
        cc=[editor_in_chief_email_address, responsible_email_address],
    )
    msg.attach_alternative(msg_html, TEXT_HTML)
    msg.send()


def email_production_manager_unfinished_requests(requests):
    context = {
        'requests': requests
    }

    msg_plain = render_to_string('email/txt/production_manager_unfinished_requests.txt', context)
    msg_html = render_to_string('email/html/production_manager_unfinished_requests.html', context)

    production_manager_email_address = \
        [user.email for user in get_production_manager()] if get_production_manager().exists() else ''

    msg = EmailMultiAlternatives(
        subject='Lezáratlan anyagok',
        body=msg_plain,
        to=[production_manager_email_address],
    )
    msg.attach_alternative(msg_html, TEXT_HTML)
    msg.send()
