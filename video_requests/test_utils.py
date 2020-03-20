from datetime import datetime
from random import randint

from video_requests.models import Request, Comment, CrewMember, Video, Rating


def create_request(request_id, user):
    request = Request()
    request.id = request_id
    request.title = 'Test Request ' + str(request_id) + ' - ' + user.username
    request.time = datetime.now()
    request.place = 'Test place'
    request.type = 'Test type'
    request.requester = user
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


def create_video(video_id, request):
    video = Video()
    video.id = video_id
    video.request = request
    video.title = 'Test video - ' + str(video_id)
    video.save()
    return video


def create_comment(comment_id, request, user, internal):
    comment = Comment()
    comment.id = comment_id
    comment.request = request
    comment.author = user
    comment.text = 'Sample text - ' + user.username + ' (' + str(internal) + ')'
    comment.internal = internal
    comment.save()
    return comment


def create_rating(rating_id, video, user):
    rating = Rating()
    rating.id = rating_id
    rating.video = video
    rating.author = user
    rating.rating = randint(1, 5)
    rating.review = 'Sample text - ' + user.username
    rating.save()
    return rating
