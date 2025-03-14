from geohosting.utils.paystack import (
    verify_paystack_payment,
    cancel_subscription as cancel_paystack_subscription
)
from geohosting.utils.stripe import (
    get_checkout_detail, cancel_subscription as cancel_stripe_subscription
)


class PaymentGateway:
    """Payment Gateway."""

    def __init__(self, payment_id):
        """Initialize payment gateway."""
        self.payment_id = payment_id

    def payment_verification(self):
        """Payment verification."""
        raise NotImplementedError

    def cancel_subscription(self):
        """Get subscription id."""
        raise NotImplementedError


class StripePaymentGateway(PaymentGateway):
    """Stripe Payment Gateway."""

    def payment_verification(self) -> bool:
        """Payment verification."""
        detail = get_checkout_detail(self.payment_id)
        if not detail:
            return False
        if detail.invoice:
            return True
        return False

    def cancel_subscription(self):
        """Get subscription id."""
        cancel_stripe_subscription(self.payment_id)


class PaystackPaymentGateway(PaymentGateway):
    """Paystack Payment Gateway."""

    def payment_verification(self) -> bool:
        """Payment verification."""
        response = verify_paystack_payment(self.payment_id)
        if not response:
            return False
        try:
            if response['data']['status'] == 'success':
                return True
        except KeyError:
            return False

    def cancel_subscription(self):
        """Get subscription id."""
        cancel_paystack_subscription(self.payment_id)
