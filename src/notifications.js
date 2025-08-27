
import notifee, {
  AndroidImportance,
  AndroidCategory,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

export async function createChannel() {
  return await notifee.createChannel({
    id: 'reminders',
    name: 'Reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}

export async function scheduleNotification({ id, title, date }) {
  const channelId = await createChannel();

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
    alarmManager: true,
  };

  await notifee.createTriggerNotification(
    {
      id,
      title: '⏰ Reminder',
      body: title,
      android: {
        channelId,
        category: AndroidCategory.REMINDER,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
        actions: [
          { title: '✅ Yes', pressAction: { id: 'yes' } },
          { title: '❌ No', pressAction: { id: 'no' } },
        ],
      },
      data: { scheduleId: id },
    },
    /** @type {TimestampTrigger} */ (trigger)
  );
}
export function registerForegroundHandler() {
  return notifee.onForegroundEvent(async ({ type, detail }) => {
    try {
      if (type === EventType.ACTION_PRESS) {
        const choice = detail.pressAction?.id;
        const scheduleId = detail.notification?.data?.scheduleId;
        if ((choice === 'yes' || choice === 'no') && scheduleId) {
          await saveResponse(scheduleId, choice);
        }
        if (detail.notification?.id) {
          await notifee.cancelDisplayedNotification(detail.notification.id);
        }
      }
    } catch (err) {
      console.warn('Foreground handler error', err);
    }
  });
}