from django.utils import timezone
from video_requests.emails import email_user_video_published


def update_request_status(request, called_from_video=False):
    # Check if the status is set by admin (overwrites everything)
    if "status_by_admin" in request.additional_data:
        if "status" in request.additional_data["status_by_admin"]:
            request.status = request.additional_data["status_by_admin"]["status"]

    # If status is not set by admin follow the flow and check if all required data are provided.
    else:
        # Incrementing this status variable if the required part is correct.
        status = 1

        # Check if request is accepted else consider as denied
        if "accepted" in request.additional_data:
            status = 2 if request.additional_data["accepted"] is True else 0

        # If the request is accepted but canceled by requester set the status
        if 2 <= status < 9 and "canceled" in request.additional_data:
            status = 9 if request.additional_data["canceled"] is True else status

        # If the request is accepted but we failed to record it set the status
        if 2 <= status < 9 and "failed" in request.additional_data:
            status = 10 if request.additional_data["failed"] is True else status

        # If the status is not canceled or failed and the request is accepted check if the end date is earlier than now
        if 2 <= status < 9 and request.end_datetime < timezone.now():
            status = 3

        # If path in recording is specified consider as successful recording and update video status
        if 2 <= status < 9 and "recording" in request.additional_data:
            if "path" in request.additional_data["recording"]:
                status = 4
                for video in request.videos.all():
                    update_video_status(video, True)

        # If all videos are edited set the request status
        if status == 4:
            if request.videos.exists() and all(
                video.status >= 3 for video in request.videos.all()
            ):
                status = 5

        # If all videos are done and the recording is copied to Google Drive set the status
        if status == 5:
            if (
                all(video.status == 6 for video in request.videos.all())
                and "copied_to_gdrive" in request.additional_data["recording"]
            ):
                status = (
                    6
                    if request.additional_data["recording"]["copied_to_gdrive"] is True
                    else status
                )

        # If the recording is removed set the status
        if status == 6:
            if "removed" in request.additional_data["recording"]:
                status = (
                    7
                    if request.additional_data["recording"]["removed"] is True
                    else status
                )

        # Set the request status to the final score
        request.status = status

    request.save()


def update_video_status(video, called_from_request=False):
    # Check if the status is set by admin (overwrites everything)
    if "status_by_admin" in video.additional_data:
        if "status" in video.additional_data["status_by_admin"]:
            video.status = video.additional_data["status_by_admin"]["status"]

    # If status is not set by admin follow the flow and check if all required data are provided.
    else:
        # Incrementing this status variable if the required part is correct.
        status = 1

        # If the the event was recorded and the video has an editor
        if video.request.status >= 4 and video.editor:
            status = 2

        # Check if the editing_done field is True
        if status == 2 and "editing_done" in video.additional_data:
            status = 3 if video.additional_data["editing_done"] is True else status

        # Check if the video is coded on the website
        if status == 3 and "coding" in video.additional_data:
            if "website" in video.additional_data["coding"]:
                status = (
                    4 if video.additional_data["coding"]["website"] is True else status
                )

        # Check if the video is published on the website
        if status == 4 and "publishing" in video.additional_data:
            if (
                "website" in video.additional_data["publishing"]
                and video.additional_data["publishing"]["website"]
            ):
                status = 5
                # If the current status of the video is before published sent an e-mail to the requester
                if video.status < 5:
                    # TODO: Check if an e-mail was already sent
                    email_user_video_published.delay(video.id)

        # Check if the HQ export has been moved to its place
        if status == 5 and "archiving" in video.additional_data:
            if "hq_archive" in video.additional_data["archiving"]:
                status = (
                    6
                    if video.additional_data["archiving"]["hq_archive"] is True
                    else status
                )

        # Set the video status to the final score
        video.status = status

    # Save the status and update the status of the request as well
    video.save()
    if not called_from_request:
        update_request_status(video.request, True)
