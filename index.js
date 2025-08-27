

// AppRegistry.registerComponent(appName, () => App);
import { AppRegistry } from 'react-native';
import App from './App';
import notifee, { EventType } from '@notifee/react-native';
import { saveResponse } from './src/firestore';
import { name as appName } from './app.json';

// Background notification tap handler
notifee.onBackgroundEvent(async ({ type, detail }) => {
  try {
    if (type === EventType.ACTION_PRESS) {
      const choice = detail.pressAction?.id;
      const scheduleId = detail.notification?.data?.scheduleId;
      if ((choice === 'yes' || choice === 'no') && scheduleId) {
        await saveResponse(scheduleId, choice);
      }
      if (detail.notification?.id) {
        await notifee.cancelNotification(detail.notification.id);
      }
    }
  } catch (err) {
    console.warn('Background handler error', err);
  }
});

AppRegistry.registerComponent(appName, () => App);
