import RazorpayCheckout from 'react-native-razorpay';
import { CONFIG } from '@/constants/config';
import { PLANS } from '@/constants/plans';

interface PaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

class RazorpayService {
  async initiatePayment(planId: string, user: { phone: string; email?: string }): Promise<PaymentResult> {
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan || plan.price === 0) throw new Error('Invalid plan');

    // Create order on backend
    const orderResponse = await fetch(`${CONFIG.BACKEND_API_URL}/subscription/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });

    if (!orderResponse.ok) throw new Error('Failed to create order');
    const order = await orderResponse.json();

    const options = {
      description: `ShieldAI Family — ${plan.name} Plan`,
      image: 'https://shieldai.dev/icon.png',
      currency: 'INR',
      key: CONFIG.RAZORPAY_KEY_ID,
      amount: plan.price,
      order_id: order.id,
      name: 'ShieldAI Family',
      prefill: { contact: user.phone, email: user.email ?? '' },
      theme: { color: '#0D9488' },
    };

    const result = await RazorpayCheckout.open(options);

    // Verify payment on backend
    await fetch(`${CONFIG.BACKEND_API_URL}/subscription/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: result.razorpay_payment_id,
        orderId: order.id,
        signature: result.razorpay_signature,
      }),
    });

    return result;
  }
}

export const razorpayService = new RazorpayService();
