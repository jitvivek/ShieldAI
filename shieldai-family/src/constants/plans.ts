export type PlanId = 'free' | 'premium' | 'family' | 'annual_premium' | 'annual_family';

interface Plan {
  id: PlanId;
  name: string;
  nameHi: string;
  price: number; // in paise
  period: 'monthly' | 'annual';
  devices: number;
  scansPerDay: number | null;
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    nameHi: 'मुफ़्त',
    price: 0,
    period: 'monthly',
    devices: 1,
    scansPerDay: 20,
    features: ['basic_monitoring', 'local_pii_scan', 'daily_limit'],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    nameHi: 'प्रीमियम',
    price: 14900,
    period: 'monthly',
    devices: 3,
    scansPerDay: null,
    features: ['unlimited_scans', 'whatsapp_reports', 'realtime_alerts', 'custom_rules', 'priority_support'],
  },
  family: {
    id: 'family',
    name: 'Family',
    nameHi: 'परिवार',
    price: 24900,
    period: 'monthly',
    devices: 5,
    scansPerDay: null,
    features: ['unlimited_scans', 'whatsapp_reports', 'realtime_alerts', 'custom_rules', 'priority_support', 'export_data', 'multi_child'],
  },
  annual_premium: {
    id: 'annual_premium',
    name: 'Premium Annual',
    nameHi: 'प्रीमियम वार्षिक',
    price: 119900,
    period: 'annual',
    devices: 3,
    scansPerDay: null,
    features: ['unlimited_scans', 'whatsapp_reports', 'realtime_alerts', 'custom_rules', 'priority_support'],
  },
  annual_family: {
    id: 'annual_family',
    name: 'Family Annual',
    nameHi: 'परिवार वार्षिक',
    price: 199900,
    period: 'annual',
    devices: 5,
    scansPerDay: null,
    features: ['unlimited_scans', 'whatsapp_reports', 'realtime_alerts', 'custom_rules', 'priority_support', 'export_data', 'multi_child'],
  },
};
