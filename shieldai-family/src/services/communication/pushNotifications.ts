import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

class PushNotifications {
  async initialize(): Promise<string | null> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'Safety Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });

      await Notifications.setNotificationChannelAsync('reports', {
        name: 'Weekly Reports',
        importance: Notifications.AndroidImportance.DEFAULT,
      });

      await Notifications.setNotificationChannelAsync('panic', {
        name: 'Panic Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500, 200, 500],
      });
    }

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  }

  async sendLocalNotification(title: string, body: string, channelId?: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
      ...(channelId && Platform.OS === 'android' ? { channelId } : {}),
    });
  }
}

export const pushNotifications = new PushNotifications();
