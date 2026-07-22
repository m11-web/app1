import { Platform } from 'react-native';
import { savePushToken } from './store';

// expo-notifications remote push was removed from Expo Go in SDK 53+.
// The package calls console.error during init in Expo Go — we suppress that
// specific message so the dev overlay doesn't appear.

let _Notifications: typeof import('expo-notifications') | null = null;

(async () => {
  if (Platform.OS === 'web') return;
  try {
    // Temporarily swallow console.error so Expo Go's dev overlay stays clean
    const orig = console.error;
    console.error = (...args: any[]) => {
      const msg = args[0] ?? '';
      if (typeof msg === 'string' && msg.includes('expo-notifications')) return;
      orig(...args);
    };
    const mod = await import('expo-notifications');
    console.error = orig; // restore immediately after import
    _Notifications = mod;
    try {
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch {
      // Expo Go – silently skip
      _Notifications = null;
    }
  } catch {
    // module not available – skip silently
  }
})();

export async function registerForPushNotifications(userId: string): Promise<void> {
  if (Platform.OS === 'web') return;

  // Allow up to 1 s for the lazy load to complete
  for (let i = 0; i < 10; i++) {
    if (_Notifications !== null) break;
    await new Promise(r => setTimeout(r, 100));
  }
  const Notifications = _Notifications;
  if (!Notifications) return; // Expo Go – silently skip

  try {
    const Constants = (await import('expo-constants')).default;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as any).easConfig?.projectId;

    const { data: token } = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    if (token) await savePushToken(userId, token);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Rena Henna',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E75480',
      });
    }
  } catch (e) {
    console.warn('Push registration:', e);
  }
}
