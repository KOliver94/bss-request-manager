def default_user_authentication_rule(user):
    return bool(user and user.is_active and not hasattr(user, "ban"))
