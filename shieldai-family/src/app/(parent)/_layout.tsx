import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

export default function ParentLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0D9488',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingTop: 4,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: 'NotoSans',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: t('tabs.activity'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t('tabs.alerts'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="warning" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('tabs.reports'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="controls"
        options={{
          title: t('tabs.controls'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="activity/[id]" options={{ href: null }} />
      <Tabs.Screen name="alerts/[id]" options={{ href: null }} />
      <Tabs.Screen name="reports/weekly" options={{ href: null }} />
      <Tabs.Screen name="controls/content-filter" options={{ href: null }} />
      <Tabs.Screen name="controls/pii-protection" options={{ href: null }} />
      <Tabs.Screen name="controls/time-limits" options={{ href: null }} />
      <Tabs.Screen name="controls/app-rules" options={{ href: null }} />
      <Tabs.Screen name="controls/age-tier" options={{ href: null }} />
      <Tabs.Screen name="controls/block-keywords" options={{ href: null }} />
      <Tabs.Screen name="children" options={{ href: null }} />
      <Tabs.Screen name="children/[id]" options={{ href: null }} />
      <Tabs.Screen name="children/add" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="settings/account" options={{ href: null }} />
      <Tabs.Screen name="settings/notifications" options={{ href: null }} />
      <Tabs.Screen name="settings/whatsapp" options={{ href: null }} />
      <Tabs.Screen name="settings/language" options={{ href: null }} />
      <Tabs.Screen name="settings/subscription" options={{ href: null }} />
      <Tabs.Screen name="settings/privacy" options={{ href: null }} />
      <Tabs.Screen name="settings/about" options={{ href: null }} />
      <Tabs.Screen name="subscription/plans" options={{ href: null }} />
      <Tabs.Screen name="subscription/payment" options={{ href: null }} />
    </Tabs>
  );
}
