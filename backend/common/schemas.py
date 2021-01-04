USER_PROFILE_AVATAR_SCHEMA = {
    "type": "object",
    "properties": {
        "provider": {"enum": ["facebook", "google-oauth2", "gravatar"]},
        "facebook": {"type": "string", "format": "uri"},
        "google-oauth2": {"type": "string", "format": "uri"},
        "gravatar": {"type": "string", "format": "uri"},
    },
    "required": ["provider"],
    "additionalProperties": False,
}
