const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

exports.sendScheduledNotification = functions.firestore
  .document('schedules/{scheduleId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const scheduleId = context.params.scheduleId;
    const fcmTokens = data.fcmTokens || [];
    const title = data.title;
    const scheduledAt = data.scheduledAt.toDate();

    // Delay until scheduled time
    const delay = scheduledAt.getTime() - Date.now();
    if (delay > 0) await new Promise(res => setTimeout(res, delay));

    // Send FCM
    const message = {
      notification: { title: '⏰ Reminder', body: title },
      tokens: fcmTokens,
      android: { priority: 'high', notification: { channelId: 'reminders' } },
    };

    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log('FCM sent:', response.successCount, 'success');
    } catch (err) {
      console.error('Error sending FCM:', err);
    }
  });
 
