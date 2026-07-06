import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Order",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("customer_login", models.CharField(blank=True, max_length=100)),
                ("customer_email", models.EmailField(max_length=254)),
                ("customer_phone", models.CharField(blank=True, max_length=32)),
                ("purpose", models.CharField(choices=[("purchase", "Purchase"), ("wallet_topup", "Wallet top-up")], default="purchase", max_length=32)),
                ("total_amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("currency", models.CharField(default="RUB", max_length=3)),
                ("status", models.CharField(choices=[("new", "New"), ("pending", "Pending"), ("paid", "Paid"), ("canceled", "Canceled"), ("failed", "Failed")], default="new", max_length=16)),
                ("frontend_return_url", models.URLField(blank=True)),
                ("yookassa_payment_id", models.CharField(blank=True, db_index=True, max_length=128)),
                ("yookassa_status", models.CharField(blank=True, max_length=64)),
                ("confirmation_url", models.URLField(blank=True, max_length=1000)),
                ("raw_payment_response", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("paid_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="PaymentEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("event", models.CharField(max_length=128)),
                ("yookassa_payment_id", models.CharField(blank=True, db_index=True, max_length=128)),
                ("payload", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="OrderItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("kind", models.CharField(choices=[("course", "Course"), ("product", "Product"), ("wallet_topup", "Wallet top-up")], max_length=16)),
                ("source_id", models.CharField(max_length=64)),
                ("title", models.CharField(max_length=255)),
                ("quantity", models.PositiveIntegerField(default=1)),
                ("unit_price", models.DecimalField(decimal_places=2, max_digits=12)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("payload", models.JSONField(blank=True, default=dict)),
                ("order", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="payments.order")),
            ],
            options={
                "ordering": ["id"],
            },
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["status", "created_at"], name="payments_or_status_9fdc95_idx"),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["purpose", "created_at"], name="payments_or_purpose_778145_idx"),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["yookassa_payment_id"], name="payments_or_yookas_184b61_idx"),
        ),
    ]
