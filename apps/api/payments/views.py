from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, OrderItem, PaymentEvent
from .serializers import CreatePaymentSerializer, CreateWalletTopupSerializer, OrderSerializer
from .services import YooKassaError, create_payment, get_payment, webhook_secret_matches


def _frontend_return_url(base_url, order_id, fallback_path="checkout"):
    configured_base = getattr(settings, "FRONTEND_URL", "").rstrip("/")
    if configured_base:
        return f"{configured_base}/{fallback_path}?order_id={order_id}"
    separator = "&" if "?" in base_url else "?"
    return f"{base_url}{separator}order_id={order_id}"


class CreatePaymentView(APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        order = Order.objects.create(
            customer_login=data.get("login", ""),
            customer_email=data["email"],
            customer_phone=data.get("phone", ""),
            purpose=data.get("purpose", Order.Purpose.PURCHASE),
            total_amount=data["total_amount"],
            frontend_return_url="",
            status=Order.Status.NEW,
        )
        order.frontend_return_url = _frontend_return_url(data["return_url"], order.id)
        order.save(update_fields=["frontend_return_url", "updated_at"])

        for item in data["items"]:
            quantity = item.get("qty", 1) if item["kind"] == "product" else 1
            price = Decimal(item["price"])
            payload = {
                "id": item["id"],
                "kind": item["kind"],
                "title": item["title"],
                "price": str(price),
                "qty": quantity,
                "city": item.get("city", ""),
                "brand": item.get("brand", ""),
                "stream": item.get("stream", ""),
            }
            OrderItem.objects.create(
                order=order,
                kind=item["kind"],
                source_id=str(item["id"]),
                title=item["title"],
                quantity=quantity,
                unit_price=price,
                amount=price * quantity,
                payload=payload,
            )

        try:
            payment = create_payment(order)
        except YooKassaError as exc:
            order.status = Order.Status.FAILED
            order.save(update_fields=["status", "updated_at"])
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        confirmation_url = payment.get("confirmation", {}).get("confirmation_url", "")
        order.status = Order.Status.PENDING
        order.yookassa_payment_id = payment.get("id", "")
        order.yookassa_status = payment.get("status", "")
        order.confirmation_url = confirmation_url
        order.raw_payment_response = payment
        order.save(update_fields=[
            "status",
            "yookassa_payment_id",
            "yookassa_status",
            "confirmation_url",
            "raw_payment_response",
            "updated_at",
        ])

        return Response({
            "order_id": str(order.id),
            "payment_id": order.yookassa_payment_id,
            "status": order.status,
            "confirmation_url": confirmation_url,
        }, status=status.HTTP_201_CREATED)


class OrderStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, order_id):
        order = get_object_or_404(Order.objects.prefetch_related("items"), id=order_id)

        if order.status == Order.Status.PENDING and order.yookassa_payment_id:
            try:
                payment = get_payment(order.yookassa_payment_id)
            except YooKassaError:
                payment = None
            if payment:
                _sync_order_from_payment(order, payment)

        return Response(OrderSerializer(order).data)


class OrderListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        orders = Order.objects.prefetch_related("items").order_by("-created_at")[:100]
        return Response(OrderSerializer(orders, many=True).data)


class CreateWalletTopupView(APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = CreateWalletTopupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        order = Order.objects.create(
            customer_login=data.get("login", ""),
            customer_email=data["email"],
            customer_phone=data.get("phone", ""),
            purpose=Order.Purpose.WALLET_TOPUP,
            total_amount=data["amount"],
            frontend_return_url="",
            status=Order.Status.NEW,
        )
        order.frontend_return_url = _frontend_return_url(data["return_url"], order.id, fallback_path="wallet")
        order.save(update_fields=["frontend_return_url", "updated_at"])

        OrderItem.objects.create(
            order=order,
            kind=OrderItem.Kind.WALLET_TOPUP,
            source_id="wallet_topup",
            title="Wallet top-up",
            quantity=1,
            unit_price=data["amount"],
            amount=data["amount"],
            payload={"purpose": "wallet_topup"},
        )

        try:
            payment = create_payment(order)
        except YooKassaError as exc:
            order.status = Order.Status.FAILED
            order.save(update_fields=["status", "updated_at"])
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        confirmation_url = payment.get("confirmation", {}).get("confirmation_url", "")
        order.status = Order.Status.PENDING
        order.yookassa_payment_id = payment.get("id", "")
        order.yookassa_status = payment.get("status", "")
        order.confirmation_url = confirmation_url
        order.raw_payment_response = payment
        order.save(update_fields=[
            "status",
            "yookassa_payment_id",
            "yookassa_status",
            "confirmation_url",
            "raw_payment_response",
            "updated_at",
        ])

        return Response({
            "order_id": str(order.id),
            "payment_id": order.yookassa_payment_id,
            "status": order.status,
            "confirmation_url": confirmation_url,
        }, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name="dispatch")
class YooKassaWebhookView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not webhook_secret_matches(request):
            return Response({"detail": "Invalid webhook secret"}, status=status.HTTP_403_FORBIDDEN)

        payment_id = request.data.get("object", {}).get("id", "")
        PaymentEvent.objects.create(
            event=request.data.get("event", ""),
            yookassa_payment_id=payment_id,
            payload=request.data,
        )

        if payment_id:
            try:
                payment = get_payment(payment_id)
            except YooKassaError:
                payment = request.data.get("object", {})

            order = Order.objects.filter(yookassa_payment_id=payment_id).first()
            if order:
                _sync_order_from_payment(order, payment)

        return Response({"ok": True})


def _sync_order_from_payment(order, payment):
    yookassa_status = payment.get("status", "")
    if yookassa_status == "succeeded":
        order.mark_paid(yookassa_status=yookassa_status, raw_payment=payment)
    elif yookassa_status == "canceled":
        order.mark_canceled(yookassa_status=yookassa_status, raw_payment=payment)
    elif yookassa_status:
        order.yookassa_status = yookassa_status
        order.raw_payment_response = payment
        order.save(update_fields=["yookassa_status", "raw_payment_response", "updated_at"])
