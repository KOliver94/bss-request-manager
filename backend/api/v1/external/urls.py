from django.urls import include, path

urlpatterns = [
    path(
        "sch-events/",
        include(
            ("api.v1.external.sch_events.urls", "sch-events"), namespace="sch-events"
        ),
    ),
]
