def default_user_authentication_rule(user):
    if user and user.is_active and not hasattr(user, "ban"):
        return True
    else:
        return False
