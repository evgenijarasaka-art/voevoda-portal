from django.urls import path

from . import views


urlpatterns = [
    path("create/", views.CreatePaymentView.as_view(), name="payment-create"),
    path("wallet/topup/", views.CreateWalletTopupView.as_view(), name="wallet-topup"),
    path("orders/", views.OrderListView.as_view(), name="payment-order-list"),
    path("orders/<uuid:order_id>/", views.OrderStatusView.as_view(), name="payment-order-status"),
    path("yookassa/webhook/", views.YooKassaWebhookView.as_view(), name="yookassa-webhook"),
]
