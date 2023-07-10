from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


# EmailMultiAlternatives object attributes detailed description
# https://docs.djangoproject.com/en/3.0/topics/email/#emailmessage-objects
def debug_email(subject, msg_plain):
    return EmailMultiAlternatives(
        subject=subject,
        body=msg_plain,
        to=[settings.DEBUG_EMAIL],
    )


@shared_task
def email_contact_message(name, email, message):
    context = {
        "name": name,
        "message": message,
    }
    msg_plain = render_to_string("email/txt/contact_message.txt", context)
    msg_html = render_to_string("email/html/contact_message.html", context)
    subject = "Kapcsolatfelvétel | Budavári Schönherz Stúdió"

    msg = (
        EmailMultiAlternatives(
            subject=subject,
            body=msg_plain,
            to=[email],
            cc=[settings.DEFAULT_REPLY_EMAIL],
            reply_to=[settings.DEFAULT_REPLY_EMAIL],
        )
        if not settings.DEBUG_EMAIL
        else debug_email(subject, msg_plain)
    )

    msg.attach_alternative(msg_html, "text/html")
    msg.send()
    return f"Contact message from {name} was sent successfully."
