from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("students", "0004_studentactivity_unique_student_activity"),
    ]

    operations = [
        migrations.AddField(
            model_name="student",
            name="smart_card_id",
            field=models.CharField(blank=True, max_length=10, null=True, unique=True),
        ),
    ]
