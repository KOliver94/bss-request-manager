from datetime import timedelta

import requests
from celery import shared_task
from django.conf import settings
from django.utils.timezone import localtime
from requests import RequestException
from rest_framework.exceptions import ValidationError
from video_requests.emails import email_user_video_published
from video_requests.models import Request, Video


def update_request_status(request, called_from_video=False):
    # Check if the status is set by admin (overwrites everything)
    if (
        "status_by_admin" in request.additional_data
        and "status" in request.additional_data["status_by_admin"]
        and request.additional_data["status_by_admin"]["status"]
    ):
        request.status = request.additional_data["status_by_admin"]["status"]

    # If status is not set by admin follow the flow and check if all required data are provided.
    else:
        # Incrementing this status variable if the required part is correct.
        status = Request.Statuses.REQUESTED

        # Check if request is accepted else consider as denied
        if "accepted" in request.additional_data:
            status = (
                Request.Statuses.ACCEPTED
                if request.additional_data["accepted"] is True
                else Request.Statuses.DENIED
            )
            if request.additional_data.get("external", {}).get(
                "sch_events_callback_url"
            ) and (
                request.status == Request.Statuses.REQUESTED
                or (
                    request.status == Request.Statuses.DENIED
                    and status == Request.Statuses.ACCEPTED
                )
                or (
                    request.status >= Request.Statuses.ACCEPTED
                    and status == Request.Statuses.DENIED
                )
            ):
                notify_sch_event_management_system.delay(
                    request.additional_data["external"]["sch_events_callback_url"],
                    request.additional_data["accepted"],
                )

        # If the request is accepted but canceled by requester set the status
        if (
            Request.Statuses.ACCEPTED <= status <= Request.Statuses.DONE
            and "canceled" in request.additional_data
        ):
            status = (
                Request.Statuses.CANCELED
                if request.additional_data["canceled"] is True
                else status
            )

        # If the request is accepted but we failed to record it set the status
        if (
            Request.Statuses.ACCEPTED <= status <= Request.Statuses.DONE
            and "failed" in request.additional_data
        ):
            status = (
                Request.Statuses.FAILED
                if request.additional_data["failed"] is True
                else status
            )

        # If the status is not canceled or failed and the request is accepted check if the end date is earlier than now
        if (
            Request.Statuses.ACCEPTED <= status <= Request.Statuses.DONE
            and request.end_datetime < localtime()
        ):
            status = Request.Statuses.RECORDED

        # If path in recording is specified consider as successful recording and update video status
        if status == Request.Statuses.RECORDED and request.additional_data.get(
            "recording", {}
        ).get("path"):
            status = Request.Statuses.UPLOADED
            for video in request.videos.all():
                update_video_status(video, True, status)

        # If all videos are edited set the request status
        if (
            status == Request.Statuses.UPLOADED
            and request.videos.exists()
            and all(
                video.status >= Video.Statuses.EDITED for video in request.videos.all()
            )
        ):
            status = Request.Statuses.EDITED

        # If all videos are done and the recording is copied to Google Drive set the status
        if (
            status == Request.Statuses.EDITED
            and all(
                video.status == Video.Statuses.DONE for video in request.videos.all()
            )
            and "copied_to_gdrive" in request.additional_data["recording"]
        ):
            status = (
                Request.Statuses.ARCHIVED
                if request.additional_data["recording"]["copied_to_gdrive"] is True
                else status
            )

        # If the recording is removed set the status
        if (
            status == Request.Statuses.ARCHIVED
            and "removed" in request.additional_data["recording"]
        ):
            status = (
                Request.Statuses.DONE
                if request.additional_data["recording"]["removed"] is True
                else status
            )

        # Set the request status to the final score
        request.status = status

    request.save()
    if not called_from_video:
        for video in request.videos.all():
            update_video_status(video, True)


def update_video_status(video, called_from_request=False, request_status=1):
    # Check if the status is set by admin (overwrites everything)
    if (
        "status_by_admin" in video.additional_data
        and "status" in video.additional_data["status_by_admin"]
        and video.additional_data["status_by_admin"]["status"]
    ):
        video.status = video.additional_data["status_by_admin"]["status"]

    # If status is not set by admin follow the flow and check if all required data are provided.
    else:
        # Incrementing this status variable if the required part is correct.
        status = Video.Statuses.PENDING

        # If the the event was recorded and the video has an editor
        if (
            max(video.request.status, request_status) >= Request.Statuses.UPLOADED
            and video.editor
        ):
            status = Video.Statuses.IN_PROGRESS

        # Check if the editing_done field is True
        if (
            status == Video.Statuses.IN_PROGRESS
            and "editing_done" in video.additional_data
        ):
            status = (
                Video.Statuses.EDITED
                if video.additional_data["editing_done"] is True
                else status
            )

        # Check if the video is coded on the website
        if (
            status == Video.Statuses.EDITED
            and "coding" in video.additional_data
            and "website" in video.additional_data["coding"]
        ):
            status = (
                Video.Statuses.CODED
                if video.additional_data["coding"]["website"] is True
                else status
            )

        # Check if the video is published on the website
        if status == Video.Statuses.CODED and video.additional_data.get(
            "publishing", {}
        ).get("website"):
            status = Video.Statuses.PUBLISHED
            # If the current status of the video is before published send an e-mail to the requester
            if video.status < Video.Statuses.PUBLISHED and not video.additional_data[
                "publishing"
            ].get("email_sent_to_user", False):
                email_user_video_published.delay(video.id)

        # Check if the HQ export has been moved to its place
        if (
            status == Video.Statuses.PUBLISHED
            and "archiving" in video.additional_data
            and "hq_archive" in video.additional_data["archiving"]
        ):
            status = (
                Video.Statuses.DONE
                if video.additional_data["archiving"]["hq_archive"] is True
                else status
            )

        # Set the video status to the final score
        video.refresh_from_db()  # update object from DB because async task might have changed additional_data
        video.status = status

    # Save the status and update the status of the request as well
    video.save()
    if not called_from_request:
        update_request_status(video.request, True)


def validate_request_date_correlations(instance, data):
    data = recalculate_deadline(instance, data)
    start_datetime = data.get("start_datetime")
    end_datetime = data.get("end_datetime")
    deadline = data.get("deadline")

    if instance:
        if not start_datetime:
            start_datetime = instance.start_datetime
        if not end_datetime:
            end_datetime = instance.end_datetime
        if not deadline and instance.deadline:
            deadline = instance.deadline

    if not (start_datetime <= end_datetime):
        raise ValidationError("Start time must be earlier than end.")
    if deadline and not (end_datetime.date() < deadline):
        raise ValidationError("Deadline must be later than end of the event.")
    return data


def recalculate_deadline(instance, data):
    """
    If we change the end_datetime of an existing video request but
    - we did not include a deadline in the request body
    - OR the deadline present is the same as the original
    - AND the original equal seems to be an automatically calculated one
    we recalculate the deadline and add 3 weeks to the new end_datetime
    """
    end_datetime = data.get("end_datetime")
    if instance and end_datetime and end_datetime != instance.end_datetime:
        deadline = data.get("deadline")
        if (not deadline or deadline == instance.deadline) and (
            instance.end_datetime + timedelta(weeks=3)
        ).date() == instance.deadline:
            data["deadline"] = (end_datetime + timedelta(weeks=3)).date()
    return data


@shared_task(
    bind=True,
    autoretry_for=(RequestException,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 10},
)
def notify_sch_event_management_system(self, url, accepted):
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {settings.SCH_EVENTS_TOKEN}",
    }
    data = {"accept": accepted}
    url = requests.head(url, headers=headers, allow_redirects=True).url
    response = requests.post(url, data=data, headers=headers, allow_redirects=False)
    response.raise_for_status()
    return response.json()
