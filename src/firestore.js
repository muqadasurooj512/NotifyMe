
import firestore from '@react-native-firebase/firestore';

export const schedulesCol = firestore().collection('schedules');
export const usersCol = firestore().collection('users');

// Save schedule
export async function createSchedule({ title, scheduledAt, fcmToken }) {
  const ref = schedulesCol.doc();
  await ref.set({
    title,
    scheduledAt,
    status: 'scheduled',
    fcmTokens: [fcmToken],
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

// Save user response
export async function saveResponse(scheduleId, choice) {
  const ref = schedulesCol.doc(scheduleId);
  await ref.set(
    {
      status: 'responded',
      response: choice,
      respondedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

// Save device token for a user
export async function saveFcmToken(userId, token) {
  await usersCol.doc(userId).set({ fcmToken: token }, { merge: true });
}
