from datetime import datetime, timedelta
from random import randint

from django.utils import timezone

from video_requests.models import Comment, CrewMember, Rating, Request, Todo, Video


def create_request(
    request_id,
    requester,
    status=Request.Statuses.REQUESTED,
    start=None,
    end=None,
    responsible=None,
    requested_by=None,
):
    request = Request()
    request.id = request_id
    request.title = "Test Request " + str(request_id) + " - " + requester.username
    request.start_datetime = (
        datetime.strptime(start, "%Y-%m-%dT%H:%M:%S%z") if start else timezone.now()
    )
    request.end_datetime = (
        datetime.strptime(end, "%Y-%m-%dT%H:%M:%S%z")
        if end
        else request.start_datetime + timedelta(days=1)
    )
    request.place = "Test place"
    request.type = "Test type"
    request.requester = requester
    request.requested_by = requested_by if requested_by else requester
    request.status = status
    if responsible:
        request.responsible = responsible
    request.save()
    return request


def create_crew(crew_id, request, member, position):
    crew = CrewMember()
    crew.id = crew_id
    crew.request = request
    crew.member = member
    crew.position = position
    crew.save()
    return crew


def create_video(video_id, request, status=Video.Statuses.DONE, editor=None):
    video = Video()
    video.id = video_id
    video.request = request
    video.title = "Test video - " + str(video_id)
    video.status = status
    if editor:
        video.editor = editor
    video.save()
    return video


def create_comment(comment_id, request, user, internal):
    comment = Comment()
    comment.id = comment_id
    comment.request = request
    comment.author = user
    comment.text = "Sample text - " + user.username + " (" + str(internal) + ")"
    comment.internal = internal
    comment.save()
    return comment


def create_rating(rating_id, video, user, rating_num=None):
    rating = Rating()
    rating.id = rating_id
    rating.video = video
    rating.author = user
    rating.rating = rating_num if rating_num else randint(1, 5)
    rating.review = "Sample text - " + user.username
    rating.save()
    return rating


def create_todo(todo_id, description, request, creator, video=None):
    todo = Todo()
    todo.id = todo_id
    todo.description = description
    todo.request = request
    todo.creator = creator
    todo.video = video
    todo.save()
    return todo
