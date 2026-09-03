import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(hour: number, minute = 0): Promise<string | null> {
  const ok = await requestNotificationPermission();
  if (!ok) return null;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '今日讀經',
      body: '打開 App，繼續你的讀經跑道。',
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      ...(Platform.OS === 'android' ? { channelId: 'reading-reminders' } : {}),
    },
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reading-reminders', {
      name: '讀經提醒',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return id;
}

export async function cancelReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
