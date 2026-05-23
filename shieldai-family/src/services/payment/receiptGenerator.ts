import { formatCurrency } from '@/utils/formatters';
import { PLANS } from '@/constants/plans';

class ReceiptGenerator {
  generateReceiptText(planId: string, paymentId: string, date: Date): string {
    const plan = PLANS[planId as keyof typeof PLANS];
    return `
ShieldAI Family — Payment Receipt
---
Plan: ${plan?.name ?? planId}
Amount: ${formatCurrency(plan?.price ?? 0)}
Payment ID: ${paymentId}
Date: ${date.toLocaleDateString('en-IN')}
---
Thank you for protecting your family with ShieldAI.
    `.trim();
  }
}

export const receiptGenerator = new ReceiptGenerator();
