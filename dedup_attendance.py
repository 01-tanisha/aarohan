from students.models import Attendance
from collections import defaultdict

dups = defaultdict(list)
for a in Attendance.objects.all():
    dups[(a.student_id, a.date)].append(a.id)

removed = 0
for ids in dups.values():
    if len(ids) > 1:
        for rid in ids[1:]:
            Attendance.objects.filter(id=rid).delete()
            removed += 1

print('removed', removed)
