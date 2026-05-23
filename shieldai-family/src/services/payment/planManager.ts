import { PLANS, PlanId } from '@/constants/plans';
import { useSubscriptionStore } from '@/store/subscriptionStore';

class PlanManager {
  getCurrentPlan() {
    const { planId } = useSubscriptionStore.getState();
    return PLANS[planId as PlanId] ?? PLANS.free;
  }

  canAddDevice(): boolean {
    const plan = this.getCurrentPlan();
    const { connectedDevices } = useSubscriptionStore.getState();
    return connectedDevices < plan.devices;
  }

  hasUnlimitedScans(): boolean {
    const plan = this.getCurrentPlan();
    return plan.scansPerDay === null;
  }

  getRemainingScans(usedToday: number): number | null {
    const plan = this.getCurrentPlan();
    if (plan.scansPerDay === null) return null;
    return Math.max(0, plan.scansPerDay - usedToday);
  }

  isFeatureAvailable(feature: string): boolean {
    const plan = this.getCurrentPlan();
    const premiumFeatures = ['whatsapp_reports', 'custom_rules', 'realtime_alerts', 'export_data'];
    if (premiumFeatures.includes(feature)) {
      return plan.id !== 'free';
    }
    return true;
  }
}

export const planManager = new PlanManager();
