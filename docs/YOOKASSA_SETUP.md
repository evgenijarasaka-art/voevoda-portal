# YooKassa setup

This project uses the cheapest reliable YooKassa flow: Smart Payment with redirect.
The user clicks pay, the backend creates a payment, and the browser opens the YooKassa payment page.
Card data is entered on YooKassa, not inside the portal.

The same YooKassa integration is prepared for:

1. Course/product checkout.
2. Wallet top-up.
3. Payment history.

## What to ask the customer

Ask the customer or director for:

1. Access to YooKassa personal cabinet, or a developer user invite.
2. Test shop `shopId`.
3. Test shop secret API key.
4. Production shop `shopId`.
5. Production shop secret API key.
6. Production frontend domain, for example `https://voevoda.ru`.
7. Production API domain, for example `https://api.voevoda.ru`.
8. Whether fiscal receipts are required through YooKassa.
9. VAT code for receipts. Common value for "without VAT" is `1`, but accounting must confirm it.
10. What exactly is sold: courses only, products only, or both.
11. Whether users are allowed to top up an internal wallet balance.
12. How wallet top-ups must be fiscalized: advance payment, service, or another accounting category.

Never put the secret API key into frontend env variables or browser code.

## YooKassa test shop clicks

1. Open YooKassa personal cabinet.
2. Click the current shop name.
3. Click `Add shop`.
4. Choose `Test shop`.
5. Choose payment on website.
6. Add the shop.
7. Open the test shop.
8. Go to `Settings` -> `Shop`.
9. Copy `shopId`.
10. Go to `Integration` -> `API keys`.
11. Issue or copy the secret key.
12. Go to `Integration` -> `HTTP notifications`.
13. Click `Change settings`.
14. Set URL:
   `https://API_DOMAIN/api/v1/payments/yookassa/webhook/`
15. Enable events:
   `payment.succeeded`
   `payment.canceled`
16. Save.

For local development, use a public HTTPS tunnel for the API domain.

## Server env variables

Set these on the API server:

```env
FRONTEND_URL=https://FRONTEND_DOMAIN
CORS_ALLOWED_ORIGINS=https://FRONTEND_DOMAIN
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
YOOKASSA_RECEIPTS_ENABLED=0
YOOKASSA_DEFAULT_VAT_CODE=1
```

Enable receipts only after the customer/accounting confirms the YooKassa receipt setup:

```env
YOOKASSA_RECEIPTS_ENABLED=1
```

## Deploy checklist

1. Deploy backend with env variables.
2. Run migrations:

```bash
cd apps/api
python manage.py migrate
```

3. Deploy frontend with:

```env
VITE_API_URL=https://API_DOMAIN/api/v1
```

4. In YooKassa, set webhook URL:
   `https://API_DOMAIN/api/v1/payments/yookassa/webhook/`
5. Make a test course/product payment with YooKassa test card.
6. Make a test wallet top-up from `/wallet`.
7. Check Django admin: orders should move from `pending` to `paid`.
8. Check `/payments`: real orders should appear in the history.
9. Check YooKassa payment history.
10. If receipts are enabled, check receipt status in YooKassa.

## How the implemented flow works

1. Frontend sends selected cart items to `POST /api/v1/payments/create/`.
2. Backend saves an order.
3. Backend creates a YooKassa payment through REST API.
4. Backend returns `confirmation_url`.
5. Frontend redirects the user to YooKassa.
6. YooKassa returns the user to `/checkout?order_id=...`.
7. Frontend checks order status.
8. YooKassa sends webhook.
9. Backend re-checks the payment through YooKassa API and marks the order as paid only if the real status is `succeeded`.

Wallet top-up works the same way, but starts with:

```text
POST /api/v1/payments/wallet/topup/
```

The user returns to:

```text
/wallet?order_id=...
```

Payment history reads real orders from:

```text
GET /api/v1/payments/orders/
```
