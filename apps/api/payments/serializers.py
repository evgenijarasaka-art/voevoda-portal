from decimal import Decimal

from rest_framework import serializers

from .models import Order, OrderItem


class CheckoutItemSerializer(serializers.Serializer):
    id = serializers.CharField()
    kind = serializers.ChoiceField(choices=["course", "product", "wallet_topup"])
    title = serializers.CharField(max_length=255)
    price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.01"))
    qty = serializers.IntegerField(required=False, min_value=1, default=1)
    city = serializers.CharField(required=False, allow_blank=True)
    brand = serializers.CharField(required=False, allow_blank=True)
    stream = serializers.CharField(required=False, allow_blank=True)


class CreatePaymentSerializer(serializers.Serializer):
    purpose = serializers.ChoiceField(choices=["purchase", "wallet_topup"], required=False, default="purchase")
    login = serializers.CharField(required=False, allow_blank=True, max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(required=False, allow_blank=True, max_length=32)
    return_url = serializers.URLField()
    items = CheckoutItemSerializer(many=True, allow_empty=False)

    def validate(self, attrs):
        total = Decimal("0.00")
        for item in attrs["items"]:
            qty = item.get("qty", 1) if item["kind"] == "product" else 1
            total += item["price"] * qty
        attrs["total_amount"] = total
        return attrs


class CreateWalletTopupSerializer(serializers.Serializer):
    login = serializers.CharField(required=False, allow_blank=True, max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(required=False, allow_blank=True, max_length=32)
    return_url = serializers.URLField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("1.00"))


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "kind", "source_id", "title", "quantity", "unit_price", "amount"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "purpose",
            "customer_email",
            "total_amount",
            "currency",
            "yookassa_payment_id",
            "yookassa_status",
            "confirmation_url",
            "items",
            "created_at",
            "paid_at",
        ]
