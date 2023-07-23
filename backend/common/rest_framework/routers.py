from rest_framework.routers import DynamicRoute, Route, SimpleRouter


class DetailOnlyRouter(SimpleRouter):
    # This router does not map list route because user can only interact with his rating and cannot see others.
    # For this reason no unique identifier is necessary as a user can only have one rating for a video.
    routes = [
        # Detail route.
        Route(
            url=r"^{prefix}{trailing_slash}$",
            mapping={
                "get": "retrieve",
                "delete": "destroy",
                "patch": "partial_update",
                "post": "create",
                "put": "update",
            },
            name="{basename}-detail",
            detail=True,
            initkwargs={"suffix": "Instance"},
        ),
        # Dynamically generated detail routes. Generated using
        # @action(detail=True) decorator on methods of the viewset.
        DynamicRoute(
            url=r"^{prefix}/{url_path}{trailing_slash}$",
            name="{basename}-{url_name}",
            detail=True,
            initkwargs={},
        ),
    ]
