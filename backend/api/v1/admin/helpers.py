from api.v1.admin.serializers import HistorySerializer


def serialize_history(objects):
    if len(objects) < 2:
        return None

    history = []
    for i in range(0, len(objects) - 1):
        new_record, old_record = objects[i], objects[i + 1]
        diff = new_record.diff_against(old_record)

        # HistoricalRecord is already created when Model.save() is called regardless of data having actually changed.
        # If there is no difference between the old and the new one do not serialize that.
        if len(diff.changes):
            history.append(diff)

    serializer = HistorySerializer(history, many=True)
    return serializer.data
