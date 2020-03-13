from datetime import datetime
from random import randint
from video_requests.models import Request, Comment, CrewMember, Video, Rating

def create_request(id, user):
    request = Request()
    request.id = id
    request.title = 'Test Request ' + str(id) + ' - ' + user.username
    request.time = datetime.now()
    request.place = 'Test place'
    request.type = 'Test type'
    request.requester = user
    request.save()
    return request


def create_crew(id, request, member, position):
    crew = CrewMember()
    crew.id = id
    crew.request = request
    crew.member = member
    crew.position = position
    crew.save()
    return crew


def create_video(id, request):
    video = Video()
    video.id = id
    video.request = request
    video.title = 'Test video - ' + str(id)
    video.save()
    return video


def create_comment(id, request, user, internal):
    comment = Comment()
    comment.id = id
    comment.request = request
    comment.author = user
    comment.text = 'Sample text - ' + user.username
    comment.internal = internal
    comment.save()
    return comment


def create_rating(id, video, user):
    rating = Rating()
    rating.id = id
    rating.video = video
    rating.author = user
    rating.rating = randint(1, 5)
    rating.review = 'Sample text - ' + user.username
    rating.save()
    return rating