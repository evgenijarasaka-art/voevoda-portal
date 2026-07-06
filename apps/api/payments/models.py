import uuid

from django.db import models
from django.utils import timezone


class Order(models.Model):
    class Purpose(models.TextChoices):
        PURCHASE = "purchase", "Purchase"
        WALLET_TOPUP = "wallet_topup", "Wallet top-up"

    class Status(models.TextChoices):
        NEW = "new", "New"
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        CANCELED = "canceled", "Canceled"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_login = models.CharField(max_length=100, blank=True)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=32, blank=True)
    purpose = models.CharField(max_length=32, choices=Purpose.choices, default=Purpose.PURCHASE)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="RUB")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.NEW)
    frontend_return_url = models.URLField(blank=True)

    yookassa_payment_id = models.CharField(max_length=128, blank=True, db_index=True)
    yookassa_status = models.CharField(max_length=64, blank=True)
    confirmation_url = models.URLField(blank=True, max_length=1000)
    raw_payment_response = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["purpose", "created_at"]),
            models.Index(fields=["yookassa_payment_id"]),
        ]

    def mark_paid(self, yookassa_status="succeeded", raw_payment=None):
        self.status = self.Status.PAID
        self.yookassa_status = yookassa_status
        self.paid_at = self.paid_at or timezone.now()
        if raw_payment is not None:
            self.raw_payment_response = raw_payment
        self.save(update_fields=["status", "yookassa_status", "paid_at", "raw_payment_response", "updated_at"])

    def mark_canceled(self, yookassa_status="canceled", raw_payment=None):
        self.status = self.Status.CANCELED
        self.yookassa_status = yookassa_status
        if raw_payment is not None:
            self.raw_payment_response = raw_payment
        self.save(update_fields=["status", "yookassa_status", "raw_payment_response", "updated_at"])

    def __str__(self):
        return f"Order {self.id} ({self.status})"


class OrderItem(models.Model):
    class Kind(models.TextChoices):
        COURSE = "course", "Course"
        PRODUCT = "product", "Product"
        WALLET_TOPUP = "wallet_topup", "Wallet top-up"

    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    kind = models.CharField(max_length=16, choices=Kind.choices)
    source_id = models.CharField(max_length=64)
    title = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payload = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.title} x {self.quantity}"


class PaymentEvent(models.Model):
    event = models.CharField(max_length=128)
    yookassa_payment_id = models.CharField(max_length=128, blank=True, db_index=True)
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
