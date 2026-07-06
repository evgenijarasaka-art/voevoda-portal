from django.contrib import admin

from .models import Order, OrderItem, PaymentEvent


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("kind", "source_id", "title", "quantity", "unit_price", "amount")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "purpose", "status", "customer_email", "total_amount", "yookassa_status", "created_at", "paid_at")
    list_filter = ("purpose", "status", "yookassa_status", "created_at")
    search_fields = ("id", "customer_email", "customer_login", "yookassa_payment_id")
    readonly_fields = ("id", "created_at", "updated_at", "paid_at", "raw_payment_response")
    inlines = [OrderItemInline]


@admin.register(PaymentEvent)
class PaymentEventAdmin(admin.ModelAdmin):
    list_display = ("event", "yookassa_payment_id", "created_at")
    search_fields = ("event", "yookassa_payment_id")
    readonly_fields = ("payload", "created_at")
