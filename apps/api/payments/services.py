import base64
import json
import uuid
from decimal import Decimal
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from django.conf import settings


class YooKassaError(Exception):
    pass


def _money(value):
    return str(Decimal(value).quantize(Decimal("0.01")))


def _auth_header():
    shop_id = getattr(settings, "YOOKASSA_SHOP_ID", "")
    secret_key = getattr(settings, "YOOKASSA_SECRET_KEY", "")
    if not shop_id or not secret_key:
        raise YooKassaError("YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY are required")
    token = base64.b64encode(f"{shop_id}:{secret_key}".encode("utf-8")).decode("ascii")
    return f"Basic {token}"


def _request(method, path, payload=None, idempotence_key=None):
    endpoint = getattr(settings, "YOOKASSA_API_ENDPOINT", "https://api.yookassa.ru/v3").rstrip("/")
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = Request(f"{endpoint}{path}", data=body, method=method)
    request.add_header("Authorization", _auth_header())
    request.add_header("Content-Type", "application/json")
    if idempotence_key:
        request.add_header("Idempotence-Key", str(idempotence_key)[:64])

    try:
        with urlopen(request, timeout=getattr(settings, "YOOKASSA_TIMEOUT", 15)) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise YooKassaError(f"YooKassa API error {exc.code}: {details}") from exc


def _receipt(order):
    if not getattr(settings, "YOOKASSA_RECEIPTS_ENABLED", False):
        return None

    default_vat_code = int(getattr(settings, "YOOKASSA_DEFAULT_VAT_CODE", 1))
    items = []
    for item in order.items.all():
        if item.kind == "course":
            payment_subject = "service"
        elif item.kind == "wallet_topup":
            payment_subject = "payment"
        else:
            payment_subject = "commodity"

        items.append({
            "description": item.title[:128],
            "quantity": float(item.quantity),
            "amount": {
                "value": _money(item.unit_price),
                "currency": order.currency,
            },
            "vat_code": default_vat_code,
            "payment_mode": "full_prepayment",
            "payment_subject": payment_subject,
            "measure": "piece",
        })

    customer = {}
    if order.customer_email:
        customer["email"] = order.customer_email
    if order.customer_phone:
        customer["phone"] = order.customer_phone
    if not customer:
        return None

    return {
        "customer": customer,
        "items": items,
    }


def create_payment(order):
    payload = {
        "amount": {
            "value": _money(order.total_amount),
            "currency": order.currency,
        },
        "capture": True,
        "confirmation": {
            "type": "redirect",
            "return_url": order.frontend_return_url,
        },
        "description": f"Voevoda order {order.id}"[:128],
        "metadata": {
            "order_id": str(order.id),
            "customer_login": order.customer_login,
        },
    }
    receipt = _receipt(order)
    if receipt:
        payload["receipt"] = receipt

    return _request("POST", "/payments", payload, idempotence_key=order.id)


def get_payment(payment_id):
    return _request("GET", f"/payments/{payment_id}")


def webhook_secret_matches(request):
    expected = getattr(settings, "YOOKASSA_WEBHOOK_SECRET", "")
    if not expected:
        return True
    return request.headers.get("X-Voevoda-Webhook-Secret") == expected
