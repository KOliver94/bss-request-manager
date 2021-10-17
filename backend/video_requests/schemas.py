REQUEST_ADDITIONAL_DATA_SCHEMA = {
    "type": "object",
    "properties": {
        "status_by_admin": {
            "type": "object",
            "properties": {
                "status": {"enum": [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, None]},
                "admin_id": {"type": "number"},
                "admin_name": {"type": "string"},
            },
            "required": ["status", "admin_id", "admin_name"],
            "additionalProperties": False,
        },
        "accepted": {"type": "boolean"},
        "canceled": {"type": "boolean"},
        "failed": {"type": "boolean"},
        "recording": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "copied_to_gdrive": {"type": "boolean"},
                "removed": {"type": "boolean"},
            },
            "additionalProperties": False,
        },
        "calendar_id": {"type": "string"},
        "requester": {
            "type": "object",
            "properties": {
                "first_name": {"type": "string"},
                "last_name": {"type": "string"},
                "phone_number": {"type": "string"},
            },
            "required": ["first_name", "last_name", "phone_number"],
            "additionalProperties": False,
        },
        "external": {
            "type": "object",
            "properties": {
                "sch_events_callback_url": {"type": "string", "format": "uri"},
            },
            "additionalProperties": False,
        },
    },
    "additionalProperties": False,
}


VIDEO_ADDITIONAL_DATA_SCHEMA = {
    "type": "object",
    "properties": {
        "status_by_admin": {
            "type": "object",
            "properties": {
                "status": {"enum": [1, 2, 3, 4, 5, 6, None]},
                "admin_id": {"type": "number"},
                "admin_name": {"type": "string"},
            },
            "required": ["status", "admin_id", "admin_name"],
            "additionalProperties": False,
        },
        "editing_done": {"type": "boolean"},
        "length": {"anyOf": [{"type": "number"}, {"type": "null"}]},
        "coding": {
            "type": "object",
            "properties": {"website": {"type": "boolean"}},
            "additionalProperties": False,
        },
        "publishing": {
            "type": "object",
            "properties": {
                "website": {"type": "string"},
                "email_sent_to_user": {"type": "boolean"},
            },
            "additionalProperties": False,
        },
        "archiving": {
            "type": "object",
            "properties": {"hq_archive": {"type": "boolean"}},
            "additionalProperties": False,
        },
        "aired": {"type": "array", "items": {"type": "string", "format": "date"}},
    },
    "additionalProperties": False,
}
